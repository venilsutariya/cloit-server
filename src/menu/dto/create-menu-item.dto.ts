export class CreateMenuItemDto {
  menuId: string;
  label: string;
  depth: number;
  parentId?: string;
  parentData?: string;
}
