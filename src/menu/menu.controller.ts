import { Body, Controller, Post, Get, Param, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Create Menu
  @Post()
  async createMenu(@Body() createMenuDto: CreateMenuDto) {
    try {
      return await this.menuService.createMenu(createMenuDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Create Menu Item
  @Post('item')
  async createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    try {
      return await this.menuService.createMenuItem(createMenuItemDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Get Menu by ID
  @Get(':id')
  async getMenuById(@Param('id') id: string) {
    try {
      return await this.menuService.getMenuById(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // Get All Menus (ID and Name)
  @Get()
  async getAllMenus() {
    return this.menuService.getAllMenus();
  }

  // Update Menu Item
  @Put('item/:id')
  async updateMenuItem(@Param('id') id: string, @Body() updateMenuItemDto: UpdateMenuItemDto) {
    try {
      return await this.menuService.updateMenuItem(id, updateMenuItemDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Delete Menu Item
  @Delete('item/:id')
  async deleteMenuItem(@Param('id') id: string) {
    try {
      return await this.menuService.deleteMenuItem(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}