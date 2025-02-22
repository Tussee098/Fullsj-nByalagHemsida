import { DropdownService } from '../services/dropdown.service';
import { Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { PostService } from '../services/posts.service'; // Import the PostService
import CategoryService from '../services/pathdata.service'
import { FooterComponent } from '../footer/footer.component';


@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [FormsModule, HeaderComponent, CommonModule,FooterComponent]
})

export class AdminComponent implements OnInit {
  inputText: string = '';
  posts: any[] = [];
  options: any[] = [];
  categories: any[] = [];
  selectedCategory: string = '';
  selectedOptionId: string = '';
  editCategoryId: string = '';

  // Variables to manage the visibility of input fields
  showNewOptionInput: boolean = false;
  showNewCategoryInput: boolean = false;
  showEditCategoryInput: boolean = false;

  // Variables to hold new category and option text
  newOptionText: string = '';
  newOptionUrl: string = '';
  newOptionCategoryId: string = '';
  newCategoryText: string = '';
  editedCategoryText: string = '';

  constructor(private postService: PostService, private categoryService: CategoryService) {} // Inject PostService

  async ngOnInit() {
    this.posts = await this.postService.fetchPosts("all"); // Use service to fetch posts
    await this.getAllItems(); // Load items when the component initializes
  }

  async getAllItems() {
    this.categories = await this.categoryService.getAllCategories();
    this.options = await this.categoryService.getAllOptions();
  }



  adjustHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + 20}px`;
  }

  async submitText(): Promise<void> {
    console.log(this.selectedOptionId)
    if (!this.selectedOptionId) {
      console.error("No option selected");
      return;
    }

    const newPost = await this.postService.submitPost("title" ,this.inputText, this.selectedOptionId); // Use service to submit post

    if (newPost) {
      this.posts.push(newPost);
      this.inputText = '';
    }
  }


  getFilteredOptions() {
    if (!this.selectedCategory) {
      return []; // Return an empty array if no category is selected
    }
    return this.options.filter(option => option.categoryId === this.selectedCategory);
  }


  // Submit the new option
  async submitNewOption() {
    if (!this.newOptionText) {
      console.error("No option text provided");
      return;
    }
    console.log(this.newOptionCategoryId)
    const newOption = await this.categoryService.addOption(this.newOptionText, this.newOptionUrl, this.newOptionCategoryId); // Use service to submit new option
    if (newOption) {
      this.options.push(newOption);
      this.newOptionText = ''; // Reset input
      this.showNewOptionInput = false; // Hide input field
      window.location.reload();
    }
  }

  // Submit the new category
  async submitNewCategory() {
    if (!this.newCategoryText) {
      console.error("No category text provided");
      return;
    }
    console.log(this.newCategoryText)
    const newCategory = await this.categoryService.addCategory(this.newCategoryText); // Use service to submit new category
    if (newCategory) {
      this.categories.push(newCategory);
      this.newCategoryText = ''; // Reset input
      this.showNewCategoryInput = false; // Hide input field
      window.location.reload();
    }

  }

  // Submit the new option
  async submitEditCategory() {
    if (!this.editedCategoryText) {
      console.error("No new name provided");
      return;
    }
    const editedCategory = await this.categoryService.editCategoryName(this.editedCategoryText, this.editCategoryId); // Use service to submit new option
    if (editedCategory) {
      this.editedCategoryText = ''; // Reset input
      this.showEditCategoryInput = false; // Hide input field
      window.location.reload();
    }
  }

  sanitizeInput() {
    this.newOptionUrl = this.newOptionUrl.replace(/[^a-zA-Z0-9]/g, ''); // Allows only alphanumeric characters
  }


}
