import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  // Create Menu
  async createMenu(createMenuDto) {
    const { name } = createMenuDto;
    return this.prisma.menu.create({
      data: {
        name,
        items: {
          create: {
            label: name,
            depth: 0,
            parentData: null,
          },
        },
      },
      include: { items: true },
    });
  }

  // Create Menu Item
  async createMenuItem(createMenuItemDto) {
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

  // Get Menu by ID
  async getMenuById(id) {
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

  // Get All Menus (ID and Name)
  async getAllMenus() {
    return this.prisma.menu.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  private buildTree(items) {
    const map = new Map();
    const roots = [];

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

  // Update Menu Item
  async updateMenuItem(id, updateData) {
    return this.prisma.menuItem.update({
      where: { id },
      data: updateData,
    });
  }

  // Delete Menu Item and its children
  async deleteMenuItem(id) {
    const items = await this.prisma.menuItem.findMany();

    const descendants = this.getDescendants(items, id);

    await this.prisma.menuItem.deleteMany({
      where: {
        id: { in: descendants },
      },
    });

    return { message: `Menu item and its children have been deleted.` };
  }

  private getDescendants(items, parentId) {
    const descendants = [];
    const queue = [parentId];

    while (queue.length) {
      const currentId = queue.shift();
      descendants.push(currentId);

      const children = items.filter(item => item.parentId === currentId);
      queue.push(...children.map(child => child.id));
    }

    return descendants;
  }
}