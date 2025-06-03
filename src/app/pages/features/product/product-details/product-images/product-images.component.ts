import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-product-images',
  templateUrl: './product-images.component.html',
  styleUrl: './product-images.component.scss'
})
export class ProductImagesComponent {
  @Input() isMultiple = '';
  @Output() onChange = new EventEmitter<any[]>();
  @ViewChild('fileDropRef', { static: true }) fileDropRef: ElementRef<HTMLInputElement>;
  @Input() productImages: any[] = [];

  @Input() enabled = false;

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.productImages.splice(index, 1);
    this.onChange.emit(this.productImages && this.productImages.length > 0 ? this.productImages : null);
  }
  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      const reader = new FileReader();
      reader.readAsDataURL(item);
      reader.onload = () => {

        if (!this.productImages) {
          this.productImages = [];
        }
        let maxSequenceId = this.productImages.reduce((max, file) => {
          const currentId = parseInt(file.sequenceId, 10);
          return currentId > max ? currentId : max;
        }, -Infinity);

        if (maxSequenceId === -Infinity || isNaN(maxSequenceId)) {
          maxSequenceId = 0;
        } else {
          maxSequenceId++;
        }
        const productImage = [{
          fileName: item.name,
          dataURL: reader.result,
          base64: reader.result.toString().split(",")[1],
          sequenceId: maxSequenceId.toString()
        }, ...this.productImages];
        this.productImages = productImage;
        this.onChange.emit(this.productImages);
      };
      if (!this.productImages) {
        this.productImages = [];
      }

    }
    if(this.fileDropRef && this.fileDropRef.nativeElement) {
      this.fileDropRef.nativeElement.value = null;
    }
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../../../../assets/img/thumbnail-product.png';
  }


  drop(event: CdkDragDrop<{
    sequenceId: string;
    fileName: string;
    dataURL: string;
  }[]>) {
    const currentData = this.productImages;
    moveItemInArray(currentData, event.previousIndex, event.currentIndex);
    currentData.forEach((item, index) => (item.sequenceId = (index + 1).toString())); // Update sequenceId as string
    this.productImages = [...currentData];

  }
}
