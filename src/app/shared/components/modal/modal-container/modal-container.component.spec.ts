import { afterEach, describe, expect, it } from 'vitest';
import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalService } from '../../../services/modal-service/modal.service';
import { Constants } from '../../../../core/constants/constants';
import { ModalSizeEnum } from '../../../../core/enums/modal-size.enum';

import type { DialogRef } from '@angular/cdk/dialog';
import type { IModalOptions } from '../../../models/modal.model';

@Component({ selector: 'app-modal-content-stub', template: '<p class="stub">{{ text }}</p>' })
class ModalContentStubComponent {
  public readonly text: string = 'content';
}

describe('ModalContainerComponent', () => {
  let modalRef: DialogRef<unknown, ModalContentStubComponent> | undefined;

  const openModal = (options: IModalOptions = {}): HTMLElement => {
    TestBed.configureTestingModule({ providers: [ModalService] });

    modalRef = TestBed.inject(ModalService).open<unknown, unknown, ModalContentStubComponent>(
      ModalContentStubComponent,
      options,
    );

    TestBed.inject(ApplicationRef).tick();

    const containers: NodeListOf<HTMLElement> = document.querySelectorAll(
      `.${Constants.MODAL_CONTAINER_CLASS}`,
    );

    return containers[containers.length - 1]!;
  };

  afterEach(() => {
    modalRef?.close();
    modalRef = undefined;
  });

  it('projects the modal content', () => {
    const container: HTMLElement = openModal();

    expect(container.querySelector('.stub')?.textContent).toBe('content');
  });

  it('is focusable and marked as a modal for assistive technology', () => {
    const container: HTMLElement = openModal({ title: 'Reset Password' });

    expect(container.getAttribute('tabindex')).toBe(Constants.MODAL_TAB_INDEX);
    expect(container.getAttribute('aria-modal')).toBe('true');
  });

  it('renders the header with title, subtitle and icon', () => {
    const container: HTMLElement = openModal({
      title: 'Reset Password',
      subtitle: 'We will email you a link',
      iconClass: 'bx bx-shield',
    });

    expect(container.querySelector('.modal__title')?.textContent).toBe('Reset Password');
    expect(container.querySelector('.modal__subtitle')?.textContent).toBe(
      'We will email you a link',
    );
    expect(container.querySelector('.modal__header .icon i')?.className).toBe('bx bx-shield');
  });

  it('omits the subtitle and icon when they are not configured', () => {
    const container: HTMLElement = openModal({ title: 'Reset Password' });

    expect(container.querySelector('.modal__subtitle')).toBeNull();
    expect(container.querySelector('.modal__header .icon')).toBeNull();
  });

  it('renders a floating close button for a headless modal', () => {
    const container: HTMLElement = openModal({ hasHeader: false });

    expect(container.querySelector('.modal__header')).toBeNull();
    expect(container.querySelector('.modal__close--floating')).not.toBeNull();
    expect(container.querySelector('.modal')?.classList.contains('modal--headless')).toBe(true);
  });

  it('drops the close button when it is disabled', () => {
    const container: HTMLElement = openModal({ title: 'Reset Password', hasCloseButton: false });

    expect(container.querySelector('.modal__close')).toBeNull();
  });

  it('applies the size modifier class', () => {
    const container: HTMLElement = openModal({ size: ModalSizeEnum.LARGE });

    expect(container.querySelector('.modal')?.classList.contains('modal--large')).toBe(true);
  });

  it('closes the dialog from the close button', () => {
    const container: HTMLElement = openModal({ title: 'Reset Password' });

    let closed: boolean = false;
    modalRef?.closed.subscribe(() => {
      closed = true;
    });

    container.querySelector<HTMLButtonElement>('.modal__close')!.click();

    expect(closed).toBe(true);
  });
});
