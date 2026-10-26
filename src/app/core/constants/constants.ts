import type {
  ConnectedPosition,
  HorizontalConnectionPos,
  VerticalConnectionPos,
} from '@angular/cdk/overlay';
import type { TranslationKey } from '../types/translation.type';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Constants {
  // inline strings

  public static readonly EMPTY_STRING: string = '';

  public static readonly EMPTY_SPACE_STRING: string = ' ';

  public static readonly COMMA: string = ',';

  public static readonly CLOSING_BRACKET: string = ')';

  public static readonly DOT: string = '.';

  public static readonly DASH: string = '-';

  public static readonly UNDERSCORE: string = '_';

  public static readonly SLASH_WITH_SPACES: string = ' / ';

  public static readonly TOKEN_KEY: string = 'radiofind_token';

  public static readonly LANGUAGE_KEY: string = 'radiofind_language';

  public static readonly UPPERCASE: string = 'uppercase';

  public static readonly LOWERCASE: string = 'lowercase';

  public static readonly NUMBER_PROPERTY: string = 'number';

  public static readonly SPECIAL_CHARACTER: string = 'specialCharacter';

  public static readonly SPACES_PROPERTY: string = 'spaces';

  public static readonly PASSWORD_MISMATCH: string = 'passwordMismatch';

  public static readonly INVALID_DATE: string = 'invalidDate';

  public static readonly SERVER_ERROR: string = 'server';

  public static readonly LOGIN: string = 'login';

  public static readonly REGISTER: string = 'register';

  public static readonly AUTH_TYPE_PROP: string = 'authType';

  public static readonly REQUIRED_PROPERTY: string = 'required';

  public static readonly SPLIT_DATE_BY_T: string = 'T';

  public static readonly ZERO_STRING: string = '0';

  public static readonly AUTH_PART_PATH: string = '/auth';

  public static readonly BEARER: string = 'Bearer';

  public static readonly CODE_FIELD_PLACEHOLDER: string = '0';

  public static readonly SELECT_FIELD_ID_PREFIX: string = 'app-select-field-';

  public static readonly CODE_FIELD_CELL_AREA_LABEL: TranslationKey = 'common.digit';

  public static readonly BACKSPACE_KEY: string = 'Backspace';

  public static readonly ARROW_LEFT_KEY: string = 'ArrowLeft';

  public static readonly ARROW_RIGHT_KEY: string = 'ArrowRight';

  public static readonly CLIPBOARD_FORMAT: string = 'text';

  public static readonly MODAL_DEFAULT_CONFIRM_TEXT: TranslationKey = 'common.confirm';

  public static readonly MODAL_DEFAULT_CANCEL_TEXT: TranslationKey = 'common.cancel';

  public static readonly MODAL_PANEL_CLASS: string = 'modal-panel';

  public static readonly MODAL_CONTAINER_CLASS: string = 'modal-container';

  public static readonly MODAL_BACKDROP_CLASS: string = 'modal-backdrop';

  public static readonly MODAL_TITLE_ID_SUFFIX: string = '-title';

  public static readonly MODAL_TAB_INDEX: string = '-1';

  public static readonly MODAL_MAX_WIDTH: string = 'calc(100vw - 32px)';

  public static readonly MODAL_MAX_HEIGHT: string = 'calc(100vh - 32px)';

  public static readonly MODAL_AUTO_FOCUS_TARGET: string = 'first-tabbable';

  public static readonly MODAL_SIZE_SMALL: string = '440px';

  public static readonly MODAL_SIZE_MEDIUM: string = '600px';

  public static readonly MODAL_SIZE_LARGE: string = '840px';

  public static readonly TIME_SEPARATOR: string = ':';

  public static readonly CELL_FIELD: string = 'cell';

  public static readonly SPINNER_DEFAULT_SIZE: string = '24px';

  public static readonly SPINNER_DEFAULT_THICKNESS: string = '3px';

  public static readonly SPINNER_ARIA_LABEL: TranslationKey = 'common.loading';

  public static readonly LOADER_BODY_CLASS: string = 'is-loading';

  public static readonly SNACKBAR_SUCCESS_ICON_CLASS: string = 'bx bx-badge-check';

  public static readonly SNACKBAR_ERROR_ICON_CLASS: string = 'bx bx-x-circle';

  public static readonly SNACKBAR_WARNING_ICON_CLASS: string = 'bx bx-alert-triangle';

  public static readonly SNACKBAR_INFO_ICON_CLASS: string = 'bx bx-info-circle';

  public static readonly TOKEN: string = 'token';

  public static readonly ERROR_TYPE_PROP: string = 'errorType';

  public static readonly EMAIL_SENT_SUCCESSFULLY: TranslationKey = 'messages.emailSent';

  public static readonly PASSWORD_RESET_SUCCESSFULLY: TranslationKey = 'messages.passwordReset';

  public static readonly POPOVER_DEFAULT_WIDTH: string = '360px';

  public static readonly POPOVER_MAX_WIDTH: string = 'calc(100vw - 32px)';

  public static readonly SIDEBAR_COLLAPSE_ARIA_LABEL: TranslationKey = 'sidebar.collapse';

  public static readonly SIDEBAR_EXPAND_ARIA_LABEL: TranslationKey = 'sidebar.expand';

  public static readonly CHEVRON_LEFT_ICON_CLASS: string = 'bx bx-chevron-left';

  public static readonly CHEVRON_RIGHT_ICON_CLASS: string = 'bx bx-chevron-right';

  public static readonly MOBILE_MEDIA_QUERY: string = '(max-width: 640px)';

  public static readonly MIN_SCSS_FUNCTION_OPENS: string = 'min(';

  public static readonly FILE_FORM_DATA: string = 'file';

  public static readonly PROFILE_PHOTO: TranslationKey = 'avatar.title';

  public static readonly AVATAR_SUBTITLE: TranslationKey = 'avatar.subtitle';

  public static readonly CAMERA_ICON: string = 'bx bx-camera';

  public static readonly SETTINGS_SAVED: TranslationKey = 'messages.settingsSaved';

  public static readonly SETTINGS_SAVE_FAILED: TranslationKey = 'messages.settingsSaveFailed';

  public static readonly SETTINGS_LOAD_FAILED: TranslationKey = 'messages.settingsLoadFailed';

  public static readonly TOGGLE_ENABLED_TEXT: TranslationKey = 'common.enabled';

  public static readonly TOGGLE_DISABLED_TEXT: TranslationKey = 'common.disabled';

  public static readonly FIRST_GRADIENT_COLOR_PROPERTY: string = '--first-gradient-color';

  public static readonly SECOND_GRADIENT_COLOR_PROPERTY: string = '--second-gradient-color';

  public static readonly MAIN_COLOR_PROPERTY: string = '--main-color';

  public static readonly URL_PROPERTY: string = 'url';

  public static readonly SOCIAL_LINK_PROPERTY: string = 'socialLink';

  public static readonly SAME_EMAIL_PROPERTY: string = 'sameEmail';

  public static readonly PROFILE_INFORMATION_SAVED: TranslationKey = 'messages.profileSaved';

  public static readonly PROFILE_SAVE_FAILED: TranslationKey = 'messages.profileSaveFailed';

  public static readonly PROFILE_LOAD_FAILED: TranslationKey = 'messages.profileLoadFailed';

  public static readonly EMAIL_CHANGED_SIGN_IN_AGAIN: TranslationKey =
    'messages.emailChangedSignInAgain';

  public static readonly UNSAVED_CHANGES_TITLE: TranslationKey = 'modals.unsavedChangesTitle';

  public static readonly UNSAVED_CHANGES_ICON_CLASS: string = 'bx bx-alert-triangle';

  public static readonly UNSAVED_CHANGES_MESSAGE: TranslationKey = 'modals.unsavedChangesMessage';

  public static readonly YES: TranslationKey = 'common.yes';

  public static readonly NO: TranslationKey = 'common.no';

  public static readonly ADD_LABEL: TranslationKey = 'common.add';

  public static readonly MENU_TEMPLATE_NAME: string = 'menu';

  // magic numbers

  public static readonly ZERO: number = 0;

  public static readonly ONE: number = 1;

  public static readonly MIN_LINGTH_FORM_VALIDATION_NAME: number = 2;

  public static readonly MIN_LINGTS_FORM_VALIDATION_PASSWORD: number = 8;

  public static readonly MAX_LENGTH_FORM_PASSWORD: number = 72;

  public static readonly MAX_LENGTH_FORM_ARTIST_OR_BAND_NAME: number = 50;

  public static readonly MAX_LENGTH_FORM_NAME: number = 100;

  public static readonly MAX_LENGTH_FORM_EMAIL: number = 254;

  public static readonly MAX_LENGTH_FORM_SHORT_DESCRIPTION: number = 160;

  public static readonly MAX_LENGTH_FORM_DESCRIPTION: number = 1000;

  public static readonly MAX_MAIN_GENRES: number = 3;

  public static readonly MAX_ADDITIONAL_GENRES: number = 10;

  public static readonly SHORT_DESCRIPTION_TEXTAREA_ROWS: number = 3;

  public static readonly DESCRIPTION_TEXTAREA_ROWS: number = 5;

  public static readonly HTTP_BAD_REQUEST_STATUS: number = 400;

  public static readonly HTTP_UNAUTHORIZED_STATUS: number = 401;

  public static readonly HTTP_CONFLICT_STATUS: number = 409;

  public static readonly HTTP_TOO_MANY_REQUESTS_STATUS: number = 429;

  public static readonly MIN_BIRTH_DATE: number = 100;

  public static readonly INVALID_DATA_MESSAGE_TIME: number = 3000;

  public static readonly DEFAULT_TEXTAREA_ROWS: number = 10;

  public static readonly DATE_PAD_LENGTH: number = 2;

  public static readonly CODE_FIELD_DEFAULT_LENGTH: number = 6;

  public static readonly NOT_FOUND_INDEX: number = -1;

  public static readonly RESEND_TIMEOUT_SECONDS: number = 45;

  public static readonly TIMER_INTERVAL_MS: number = 1000;

  public static readonly SECONDS_IN_MINUTE: number = 60;

  public static readonly TIME_PAD_LENGTH: number = 2;

  public static readonly SNACKBAR_DURATION_MS: number = 2000;

  public static readonly SNACKBAR_MAX_STACK: number = 3;

  public static readonly POPOVER_OFFSET: number = 12;

  public static readonly DROPDOWN_OFFSET: number = 8;

  public static readonly DROPDOWN_NESTED_OFFSET: number = 4;

  public static readonly DROPDOWN_NESTED_INDENT: number = 24;

  public static readonly MILLISECONDS_IN_ONE_SECOND: number = 1000;

  // others

  public static readonly LOADER_BLOCKED_EVENTS: readonly string[] = [
    'keydown',
    'keypress',
    'keyup',
    'wheel',
    'touchmove',
  ];

  public static readonly EN_VALIDATOR_PATTERN: RegExp = /^[A-Za-z-]+$/;

  public static readonly UPPERCASE_VALIDATOR_PATTERN: RegExp = /[A-Z]/;

  public static readonly LOWERCASE_VALIDATOR_PATTERN: RegExp = /[a-z]/;

  public static readonly DECIMAL_VALIDATOR_PATTERN: RegExp = /\d/;

  public static readonly SPECIAL_CHARACTER_VALIDATOR_PATTERN: RegExp =
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

  public static readonly EN_PLUS_SPACES_AND_SYMBOLS: RegExp =
    /^[0-9A-Za-z\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/;

  public static readonly SPACES_VALIDATOR_PATTERN: RegExp = /\s/;

  public static readonly TRANSLATION_PARAM_PATTERN: RegExp = /\{(\w+)\}/g;

  public static readonly NOT_DIGIT_PATTERN: RegExp = /\D/g;

  public static readonly ALLOWED_URL_PROTOCOLS: readonly string[] = ['http:', 'https:'];

  public static readonly START_HORIZONTAL_ALIGNMENT: HorizontalConnectionPos = 'start';

  public static readonly CENTER_HORIZONTAL_ALIGNMENT: HorizontalConnectionPos = 'center';

  public static readonly END_HORIZONTAL_ALIGNMENT: HorizontalConnectionPos = 'end';

  public static readonly TOP_VERTICAL_ALIGNMENT: VerticalConnectionPos = 'top';

  public static readonly BOTTOM_VERTICAL_ALIGNMENT: VerticalConnectionPos = 'bottom';

  public static readonly DROPDOWN_POSITIONS: readonly ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: Constants.DROPDOWN_OFFSET,
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -Constants.DROPDOWN_OFFSET,
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: Constants.DROPDOWN_OFFSET,
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -Constants.DROPDOWN_OFFSET,
    },
  ];

  // Submenus open to the side; on narrow screens they fall back to below the parent item.
  public static readonly DROPDOWN_NESTED_POSITIONS: readonly ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: Constants.DROPDOWN_NESTED_OFFSET,
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'top',
      offsetX: -Constants.DROPDOWN_NESTED_OFFSET,
    },
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: Constants.DROPDOWN_NESTED_INDENT,
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetX: Constants.DROPDOWN_NESTED_INDENT,
    },
  ];
}
