import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeoResolver implements Resolve<void> {
  constructor(private title: Title, private meta: Meta) {}

  resolve(route: ActivatedRouteSnapshot): void {
    if (route.data['title']) {
      this.title.setTitle(`${route.data['title']} | ${environment.serviceName}`);
    } else {
      this.title.setTitle(environment.serviceName);
    }
    
    if (route.data['description']) {
      this.meta.updateTag({ name: 'description', content: route.data['description'] });
    }
    
    if (route.data['keywords']) {
      this.meta.updateTag({ name: 'keywords', content: route.data['keywords'] });
    }
  }
}