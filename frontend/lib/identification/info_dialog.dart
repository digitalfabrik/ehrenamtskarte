import 'package:flutter/material.dart';
import 'package:flutter_i18n/widgets/I18nText.dart';

class InfoDialog extends StatelessWidget {
  final Widget child;
  final String title;
  final IconData icon;
  final Color? iconColor;

  const InfoDialog({
    super.key,
    required this.child,
    required this.title,
    required this.icon,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AlertDialog(
      title: ListTile(
        leading: Icon(icon, color: iconColor ?? theme.colorScheme.primaryContainer, size: 30),
        title: Text(title, style: theme.textTheme.headlineSmall),
      ),
      content: child,
      actions: [TextButton(onPressed: () => Navigator.of(context).pop(), child: I18nText('ok'))],
    );
  }
}
