import { ErrorTypeEnum } from '../../core/enums/error-type.enum';

import type { ErrorType } from '../../core/types/error-type.type';
import type { IErrorContent } from '../models/error-content.model';

export const ERROR_PAGE_CONTENT: Readonly<Record<ErrorType, IErrorContent>> = {
  [ErrorTypeEnum.NOT_FOUND]: {
    code: '404',
    title: 'Page Not ',
    titleColor: 'Found',
    description:
      'The page you are looking for does not exist or has been moved. Let us bring you back to the music.',
    iconClass: 'bx bx-compass',
  },
  [ErrorTypeEnum.FORBIDDEN]: {
    code: '403',
    title: 'Access ',
    titleColor: 'Denied',
    description:
      'You do not have permission to open this page. Log in with another account or return to your workspace.',
    iconClass: 'bx bx-lock-keyhole',
  },
  [ErrorTypeEnum.SERVER_ERROR]: {
    code: '500',
    title: 'Something Went ',
    titleColor: 'Wrong',
    description:
      'Our servers hit a wrong note. We are already working on it, please try again in a few moments.',
    iconClass: 'bx bx-server',
  },
};
