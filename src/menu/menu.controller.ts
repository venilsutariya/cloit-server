import { Body, Controller, Post, Get, Param, Put, Delete } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Create Menu
  @Post()
  async createMenu(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.createMenu(createMenuDto);
  }

  // Create Menu Item
  @Post('item')
  async createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuService.createMenuItem(createMenuItemDto);
  }

  // Get Menu by ID
  @Get(':id')
  async getMenuById(@Param('id') id: string) {
    return this.menuService.getMenuById(id);
  }

  // Get All Menus (ID and Name)
  @Get()
  async getAllMenus() {
    return this.menuService.getAllMenus();
  }

  // Update Menu Item
  @Put('item/:id')
  async updateMenuItem(
    @Param('id') id: string,
    @Body() updateMenuItemDto: CreateMenuItemDto,
  ) {
    return this.menuService.updateMenuItem(id, updateMenuItemDto);
  }

  // Delete Menu Item
  @Delete('item/:id')
  async deleteMenuItem(@Param('id') id: string) {
    return this.menuService.deleteMenuItem(id);
  }
}