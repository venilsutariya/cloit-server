export class CreateMenuItemDto {
  menuId: string;
  label: string;
  depth: number;
  parentId?: string; // Optional parent ID for hierarchical structure
  parentData?: string; // Optional parent menu item name
}
