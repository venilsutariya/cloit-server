import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  // Create Menu
  async createMenu(createMenuDto: CreateMenuDto) {
    const { name } = createMenuDto;

    if (!name) {
      throw new BadRequestException('Menu name is required');
    }

    try {
      return await this.prisma.menu.create({
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
    } catch (error) {
      throw new BadRequestException('Failed to create menu');
    }
  }

  // Create Menu Item
  async createMenuItem(createMenuItemDto: CreateMenuItemDto) {
    const { menuId, label, depth, parentId, parentData } = createMenuItemDto;

    if (!menuId || !label) {
      throw new BadRequestException('Menu ID and label are required');
    }

    try {
      return await this.prisma.menuItem.create({
        data: {
          menuId,
          label,
          depth,
          parentId,
          parentData,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create menu item');
    }
  }

  // Get Menu by ID
  async getMenuById(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
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

  // Update Menu Item
  async updateMenuItem(id: string, updateData: UpdateMenuItemDto) {
    const menuItem = await this.prisma.menuItem.findUnique({ where: { id } });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    try {
      return await this.prisma.menuItem.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update menu item');
    }
  }

  // Delete Menu Item and its children
  async deleteMenuItem(id: string) {
    const items = await this.prisma.menuItem.findMany();

    const descendants = this.getDescendants(items, id);

    try {
      await this.prisma.menuItem.deleteMany({
        where: {
          id: { in: descendants },
        },
      });

      return { message: `Menu item and its children have been deleted.` };
    } catch (error) {
      throw new BadRequestException('Failed to delete menu item and its children');
    }
  }

  private getDescendants(items: any[], parentId: string) {
    const descendants: string[] = [];
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