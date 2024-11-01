import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DropdownService } from '../../services/dropdown.service'; // Adjust the import as necessary
import { NgFor, NgIf } from '@angular/common';
import { RouterLink , Router} from '@angular/router';
import { CategoryWithOptions } from '../../models/dropdownCategories';
import CategoryService from '../../services/pathdata.service';
import { AuthService } from '../../services/authService';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

interface Item {
  title: string; // Ensure this matches the JSON structure
  path: string;  // Ensure this matches the JSON structure
  parentCategoryId: string;
  optionId: string;
}

interface DropdownItem {
  category: string; // Represents the category name
  categoryId: string;
  items: Item[];    // Array of items under this category
  showDropdown?: boolean; // New property to track dropdown visibility
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


  constructor(private dropdownService: DropdownService, private cdr: ChangeDetectorRef, private router: Router, private categoryService: CategoryService, private authService: AuthService) {}

  async ngOnInit() {
    await this.loadItems(); // Load items when the component initializes
    this.list = this.convertToDropdownItems(this.categoriesWithOptions)
    this.loggedIn = await this.authService.isLoggedIn();

    this.loading = false
  }

  async loadItems() {
    try {
      this.categoriesWithOptions = await this.dropdownService.getCategoriesWithOptions();
    } catch (error) {
      console.error('Error loading categories with options:', error);
    }

  }

  // Drag and Drop event handler
  drop(event: CdkDragDrop<DropdownItem[]>) {
    this.hasChanged = true;
    moveItemInArray(this.list, event.previousIndex, event.currentIndex);
    moveItemInArray(this.categoriesWithOptions, event.previousIndex, event.currentIndex);  // optional if you need this synced
  }

  async saveOrder() {
    // Prepare the reordered list with only category IDs and their new order index
    const reorderedCategories = this.list.map((category, index) => ({
      categoryId: category.categoryId,
      order: index
    }));

    try {
      // Call the updateCategoryOrder function from your service, passing the reordered list
      await this.categoryService.updateCategoryOrder(reorderedCategories);
      this.hasChanged = false;
      console.log("Category order saved successfully");
      // Optionally, you can set a flag or show a message to indicate success
    } catch (error) {
      console.error("Error saving category order:", error);
      // Optionally, handle the error, e.g., show an error message to the user
    }
  }


  convertToDropdownItems(categoriesWithOptions: any[]): DropdownItem[] {
    return categoriesWithOptions.map(category => ({

      category: category.category,       // Map the 'category' field directly
      categoryId: category.categoryId,
      items: category.options.map((option: { name: string; path: string; parentCategoryId: string, optionId: string}) => ({
        title: option.name,               // Map 'name' to 'title'
        path: option.path,
        parentCategoryId: option.parentCategoryId,
        optionId: option.optionId             // Map 'path' directly
      })),
      showDropdown: false                 // Initialize showDropdown as false
    }));
  }

  deleteCategory(categoryId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this category and all of its options?');

    if (confirmed) {
      // Find the category in the 'list' array
      const categoryToDelete = this.list.find(category => category.categoryId === categoryId);

      if (categoryToDelete) {
        try {
          // 1. Delete each option under the category
          for (const option of categoryToDelete.items) {
            this.categoryService.deleteOption(option.optionId).then(() => {
              console.log(`Deleted option with id: ${option.optionId}`);
            }).catch((error: any) => {
              console.error(`Error deleting option with id: ${option.optionId}`, error);
            });
          }

          // 2. After deleting all the options, delete the category
          this.categoryService.deleteCategory(categoryId).then(() => {

            // 3. Update the list to remove the deleted category
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
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (confirmed) {
      this.categoryService.deleteOption(optionId);
      window.location.reload();
    }

  }


}
