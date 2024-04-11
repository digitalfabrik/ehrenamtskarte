package app.ehrenamtskarte.backend.auth.service

import app.ehrenamtskarte.backend.auth.database.AdministratorEntity
import app.ehrenamtskarte.backend.auth.webservice.schema.types.Role
import app.ehrenamtskarte.backend.regions.database.RegionEntity

object Authorizer {

    fun mayCreateCardInRegion(user: AdministratorEntity, regionId: Int): Boolean {
        return user.regionId?.value == regionId && user.role in setOf(
            Role.REGION_MANAGER.db_value,
            Role.REGION_ADMIN.db_value
        )
    }

    fun mayDeleteCardInRegion(user: AdministratorEntity, regionId: Int): Boolean {
        return user.regionId?.value == regionId && user.role in setOf(
            Role.REGION_MANAGER.db_value,
            Role.REGION_ADMIN.db_value
        )
    }

    fun mayViewApplicationsInRegion(user: AdministratorEntity, regionId: Int): Boolean {
        return user.regionId?.value == regionId && user.role in setOf(
            Role.REGION_MANAGER.db_value,
            Role.REGION_ADMIN.db_value
        )
    }

    fun mayUpdateApplicationsInRegion(user: AdministratorEntity, regionId: Int): Boolean {
        return user.regionId?.value == regionId && user.role in setOf(
            Role.REGION_MANAGER.db_value,
            Role.REGION_ADMIN.db_value
        )
    }

    fun mayDeleteApplicationsInRegion(user: AdministratorEntity, regionId: Int): Boolean {
        return user.regionId?.value == regionId && user.role in setOf(
            Role.REGION_MANAGER.db_value,
            Role.REGION_ADMIN.db_value
        )
    }

    fun mayUpdateSettingsInRegion(user: AdministratorEntity, regionId: Int): Boolean {
        return user.regionId?.value == regionId && user.role == Role.REGION_ADMIN.db_value
    }

    fun mayViewUsersInProject(user: AdministratorEntity?, projectId: Int): Boolean {
        return user?.projectId?.value == projectId && user.role == Role.PROJECT_ADMIN.db_value
    }

    fun mayViewUsersInRegion(user: AdministratorEntity?, region: RegionEntity): Boolean {
        return (user?.role == Role.REGION_ADMIN.db_value && user.regionId == region.id) ||
            mayViewUsersInProject(user, region.projectId.value)
    }

    fun mayCreateUser(
        actingAdmin: AdministratorEntity,
        newAdminProjectId: Int,
        newAdminRole: Role,
        newAdminRegion: RegionEntity?
    ): Boolean {
        if (actingAdmin.projectId.value != newAdminProjectId) {
            return false
        } else if (newAdminRole == Role.NO_RIGHTS) {
            return false
        }

        if (actingAdmin.role == Role.PROJECT_ADMIN.db_value) {
            return true
        } else if (
            actingAdmin.role == Role.REGION_ADMIN.db_value &&
            newAdminRegion != null && actingAdmin.regionId == newAdminRegion.id &&
            newAdminRole in setOf(Role.REGION_ADMIN, Role.REGION_MANAGER)
        ) {
            return true
        }
        return false
    }

    fun mayEditUser(
        actingAdmin: AdministratorEntity,
        existingAdmin: AdministratorEntity,
        newAdminProjectId: Int,
        newAdminRole: Role,
        newAdminRegion: RegionEntity?
    ): Boolean {
        if (actingAdmin.projectId.value != newAdminProjectId || existingAdmin.projectId.value != newAdminProjectId) {
            return false
        } else if (newAdminRole == Role.NO_RIGHTS) {
            return false
        }

        if (actingAdmin.role == Role.PROJECT_ADMIN.db_value) {
            return true
        } else if (
            actingAdmin.role == Role.REGION_ADMIN.db_value &&
            existingAdmin.regionId == actingAdmin.regionId &&
            newAdminRegion != null && actingAdmin.regionId == newAdminRegion.id &&
            newAdminRole in setOf(Role.REGION_ADMIN, Role.REGION_MANAGER)
        ) {
            return true
        }
        return false
    }

    fun mayDeleteUser(
        actingAdmin: AdministratorEntity,
        existingAdmin: AdministratorEntity
    ): Boolean {
        if (actingAdmin.projectId.value != existingAdmin.projectId.value && existingAdmin.role != Role.NO_RIGHTS.db_value) {
            return false
        }

        if (actingAdmin.role == Role.PROJECT_ADMIN.db_value) {
            return true
        } else if (actingAdmin.role == Role.REGION_ADMIN.db_value && existingAdmin.regionId == actingAdmin.regionId) {
            return true
        }
        return false
    }
}
