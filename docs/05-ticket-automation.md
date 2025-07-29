# Automation Rule Feature Documentation

## Overview

The Automation Rule feature in the support-payment project is designed to streamline the handling of tickets by automatically classifying and prioritizing them. This reduces manual efforts and increases efficiency.

## Functionality

### Main Components

1. **Automation Rules**: Define conditions and actions for tickets.
2. **TicketAutomationService**: Applies rules to tickets based on given conditions.
3. **Admin Dashboard**: Manage rules through UI, enabling creating, viewing, editing, and deleting rules.

### Workflow

1. **New Ticket Creation**:
   - Analyze title and content.
   - Classify into categories: Technical, Payment, Consultation, or General.
   - Prioritize: Urgent, High, Medium, or Low.
   - Apply actions defined in matching rules.

2. **Rule Application**:
   Rules are applied in the order of `execution_order`, affecting the ticket's priority and assignment.

3. **Admin Management**:
   Access the rules management through `/admin/automation-rules`.

## Rule Definition

### Conditions

Conditions dictate when a rule is triggered. They can include:
- Title Keywords
- Content Keywords
- Categories
- Tags

Example:

```json
{
  "title_keywords": ["bug", "error", "failure"],
  "content_keywords": ["database", "server", "API"],
  "category_ids": [1, 2],
  "tag_ids": [5, 6]
}
```

### Actions

Actions are executed when conditions match. Examples include setting category, priority, department, and more.

Example:

```json
{
  "set_priority": "high",
  "set_category": "technical",
  "notify_department": true
}
```

## Best Practices

1. **Rule Order**: Place high-priority rules at the top.
2. **Comprehensive Keywords**: Use Vietnamese and English keywords for better accuracy.
3. **Regular Testing**: Test rules before activating.
4. **Monitoring**: Check matched count to assess performance.
5. **Periodic Updates**: Review and update rules regularly.

## Troubleshooting

### Common Issues

1. **Rules Not Firing**: Ensure `is_active` is true, and conditions are correct.
2. **Incorrect Priority**: Run `php artisan automation:bulk-update-scores`.
3. **Performance**: Index frequently queried columns and optimize algorithms.

## Tệp liên quan

-   `app/Models/AutomationRule.php`: Model cho các quy tắc tự động hóa.
-   `app/Services/TicketAutomationService.php`: Service chứa logic để xử lý các quy tắc.
-   `database/factories/AutomationRuleFactory.php`: Factory để tạo dữ liệu mẫu.
