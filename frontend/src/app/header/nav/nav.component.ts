// ==============================================
// nav.component.ts
// ==============================================
import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { DropdownService } from '../../services/dropdown.service';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CategoryWithOptions } from '../../models/dropdownCategories';
import CategoryService from '../../services/pathdata.service';
import { AuthService } from '../../services/authService';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

interface Item {
  title: string;
  path: string;
  parentCategoryId: string;
  optionId: string;
}

interface DropdownItem {
  category: string;
  categoryId: string;
  items: Item[];
  isOpen?: boolean;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, CdkDropList, CdkDrag],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  categoriesWithOptions: CategoryWithOptions[] = [];
  list: DropdownItem[] = [];
  loggedIn = false;
  loading = true;
  hasChanged = false;
  isMobileMenuOpen = false;

  constructor(
    private dropdownService: DropdownService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private categoryService: CategoryService,
    private authService: AuthService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      this.resetCategories();
    }
  }

  async ngOnInit() {
    await this.loadItems();
    this.list = this.convertToDropdownItems(this.categoriesWithOptions);
    this.loggedIn = await this.authService.isLoggedIn();
    this.loading = false;
  }

  async loadItems() {
    try {
      this.categoriesWithOptions = await this.dropdownService.getCategoriesWithOptions();
    } catch (error) {
      console.error('Error loading categories with options:', error);
    }
  }

  resetCategories() {
    this.list.forEach(category => category.isOpen = false);
  }

  toggleCategory(category: DropdownItem) {
    if (window.innerWidth <= 768) {
      category.isOpen = !category.isOpen;
    }
  }

  handleOptionClick() {
    if (window.innerWidth <= 768) {
      this.isMobileMenuOpen = false;
      this.resetCategories();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (!this.isMobileMenuOpen) {
      this.resetCategories();
    }
  }

  drop(event: CdkDragDrop<DropdownItem[]>) {
    this.hasChanged = true;
    moveItemInArray(this.list, event.previousIndex, event.currentIndex);
    moveItemInArray(this.categoriesWithOptions, event.previousIndex, event.currentIndex);
  }

  async saveOrder() {
    const reorderedCategories = this.list.map((category, index) => ({
      categoryId: category.categoryId,
      order: index
    }));

    try {
      await this.categoryService.updateCategoryOrder(reorderedCategories);
      this.hasChanged = false;
      console.log("Category order saved successfully");
    } catch (error) {
      console.error("Error saving category order:", error);
    }
  }

  convertToDropdownItems(categoriesWithOptions: any[]): DropdownItem[] {
    return categoriesWithOptions.map(category => ({
      category: category.category,
      categoryId: category.categoryId,
      items: category.options.map((option: { name: string; path: string; parentCategoryId: string, optionId: string}) => ({
        title: option.name,
        path: option.path,
        parentCategoryId: option.parentCategoryId,
        optionId: option.optionId
      })),
      isOpen: false
    }));
  }

  deleteCategory(categoryId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this category and all of its options?');

    if (confirmed) {
      const categoryToDelete = this.list.find(category => category.categoryId === categoryId);

      if (categoryToDelete) {
        try {
          for (const option of categoryToDelete.items) {
            this.categoryService.deleteOption(option.optionId).then(() => {
              console.log(`Deleted option with id: ${option.optionId}`);
            }).catch((error: any) => {
              console.error(`Error deleting option with id: ${option.optionId}`, error);
            });
          }

          this.categoryService.deleteCategory(categoryId).then(() => {
            this.list = this.list.filter(category => category.categoryId !== categoryId);
            window.location.reload();
          }).catch(error => {
            console.error(`Error deleting category with id: ${categoryId}`, error);
          });

        } catch (error) {
          console.error('Error deleting category or its options:', error);
        }
      } else {
        console.error('Category not found');
      }
    }
  }

  deleteOption(optionId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this option?');
    if (confirmed) {
      this.categoryService.deleteOption(optionId);
      window.location.reload();
    }
  }
}
