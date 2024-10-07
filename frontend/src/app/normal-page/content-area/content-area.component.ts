import { Component} from '@angular/core';
import { PostService } from '../../services/posts.service';
import { ActivatedRoute } from '@angular/router';
import { NgFor } from '@angular/common';
import { ContentBoxComponent } from './content-box/content-box.component';

@Component({
  selector: 'app-content-area',
  standalone: true,
  imports: [NgFor, ContentBoxComponent],
  templateUrl: './content-area.component.html',
  styleUrl: './content-area.component.scss'
})

export class ContentAreaComponent {
  title: string = "";
  posts: any[] = [];
  constructor(private postService: PostService, private route: ActivatedRoute) {}

  async ngOnInit() {
    const currentRoute = this.route.snapshot;
    this.title = currentRoute.title || 'Default Title'; // Provide a default title
    this.posts = await this.postService.fetchPosts(this.title);
    console.log(this.title)
    console.log(this.posts)
  }

}
