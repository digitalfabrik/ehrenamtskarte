import React from 'react'
import Navigation from './components/Navigation'
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { HashRouter, Route, Routes } from 'react-router-dom'
import GenerationController from './components/generation/GenerationController'
import styled from 'styled-components'
import RegionProvider from './RegionProvider'
import AuthProvider, { AuthContext } from './AuthProvider'
import Login from './components/auth/Login'
import KeepAliveToken from './KeepAliveToken'
import ApplicationsController from './components/applications/ApplicationsController'
import { ProjectConfigProvider } from './project-configs/ProjectConfigContext'
import HomeController from './components/home/HomeController'
import MetaTagsManager from './components/MetaTagsManager'
import { AppToasterProvider } from './components/AppToaster'
import UserSettingsController from "./components/user-settings/UserSettingsController";

if (!process.env.REACT_APP_API_BASE_URL) {
  throw new Error('REACT_APP_API_BASE_URL is not set!')
}

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_API_BASE_URL,
})

const createAuthLink = (token?: string) =>
  setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }))

const createClient = (token?: string) =>
  new ApolloClient({
    link: createAuthLink(token).concat(httpLink),
    cache: new InMemoryCache(),
  })

const Main = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const App = () => (
  <ProjectConfigProvider>
    <MetaTagsManager />
    <AppToasterProvider>
      <AuthProvider>
        <AuthContext.Consumer>
          {({ data: authData, signIn, signOut }) => (
            <ApolloProvider client={createClient(authData?.token)}>
              {authData !== null && authData.expiry > new Date() ? (
                <KeepAliveToken authData={authData} onSignIn={signIn} onSignOut={signOut}>
                  <RegionProvider>
                    <HashRouter>
                      <Navigation onSignOut={signOut} />
                      <Main>
                        <Routes>
                          <Route path={'/'} element={<HomeController />} />
                          <Route path={'/applications'} element={<ApplicationsController token={authData.token} />} />
                          <Route path={'/eak-generation'} element={<GenerationController />} />
                          <Route path={'/user-settings'} element={<UserSettingsController />} />
                        </Routes>
                      </Main>
                    </HashRouter>
                  </RegionProvider>
                </KeepAliveToken>
              ) : (
                <Login onSignIn={signIn} />
              )}
            </ApolloProvider>
          )}
        </AuthContext.Consumer>
      </AuthProvider>
    </AppToasterProvider>
  </ProjectConfigProvider>
)

export default App
