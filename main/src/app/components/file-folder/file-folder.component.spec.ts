import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileFolderComponent } from './file-folder.component';

describe('FileFolderComponent', () => {
  let component: FileFolderComponent;
  let fixture: ComponentFixture<FileFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileFolderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
