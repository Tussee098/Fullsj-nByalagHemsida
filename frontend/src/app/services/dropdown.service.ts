import { Injectable } from '@angular/core';
import CategoryService from './pathdata.service'; // Adjust the path as needed
import { CategoryWithOptions, Option } from './../models/dropdownCategories';

@Injectable({
  providedIn: 'root',
})
export class DropdownService {


  constructor(private categoryService: CategoryService) {}


  // Method to fetch categories with options and use caching
  async getCategoriesWithOptions(): Promise<CategoryWithOptions[]> {


    // If cache is missing or expired, fetch fresh data from CategoryService
    const categoryOptionsList: CategoryWithOptions[] = [];
    try {
      // Step 1: Get all categories
      const categories = await this.categoryService.getAllCategories();

      // Step 2: Iterate over each category and fetch options
      for (const category of categories) {
        const options = await this.categoryService.getOptionsByCategoryId(category._id);

        // Step 3: Map the options to the desired structure
        const formattedOptions: Option[] = options.map((option: { name: string; path: string; categoryId: string, _id: string}) => ({
          name: option.name,
          path: option.path,
          id: option.categoryId,
          optionId: option._id
        }));

        // Step 4: Add the category and its options to the list
        categoryOptionsList.push({
          category: category.name,
          categoryId: category._id,
          options: formattedOptions,
        });
      }



      return categoryOptionsList;

    } catch (error) {
      console.error('Error fetching categories or options:', error);
      throw error;
    }
  }


}
