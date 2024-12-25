import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async createMenu(createMenuDto: CreateMenuDto) {
    const { name } = createMenuDto;
    return this.prisma.menu.create({
      data: {
        name,
        items: {
          create: {
            label: 'System Management',
            depth: 0,
            parentData: null,
          },
        },
      },
      include: { items: true },
    });
  }

  async createMenuItem(createMenuItemDto: CreateMenuItemDto) {
    const { menuId, label, depth, parentId, parentData } = createMenuItemDto;
    return this.prisma.menuItem.create({
      data: {
        menuId,
        label,
        depth,
        parentId,
        parentData,
      },
    });
  }

  async getMenuById(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!menu) {
      throw new Error('Menu not found');
    }

    const itemsTree = this.buildTree(menu.items);

    return { ...menu, items: itemsTree };
  }

  private buildTree(items: any[]) {
    const map = new Map<string, any>();
    const roots: any[] = [];

    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    items.forEach((item) => {
      if (item.parentId) {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children.push(map.get(item.id));
        }
      } else {
        roots.push(map.get(item.id));
      }
    });

    return roots;
  }

  async updateMenuItem(id: string, updateData: Partial<CreateMenuItemDto>) {
    return this.prisma.menuItem.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteMenuItem(id: string) {
    return this.prisma.menuItem.delete({
      where: { id },
    });
  }
}