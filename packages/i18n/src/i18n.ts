///<reference lib="dom" />
import {
  Injectable,
  Inject,
  ModuleStroge,
  Resolve,
} from "@bfchain/util-dep-inject";

export const enum I18N_LANGUAGE_TYPE {
  /**汉语 */
  CHINESE = "zh_CN.UTF-8",
  /**英语 */
  ENGLISH = "en_US.UTF-8",
}

export const ERROR_CODE_LANG = Symbol("errorCodeLang");

@Injectable()
export class I18N<
  T extends BFChainUtil.SourceErrorCodeList = BFChainUtil.SourceErrorCodeList,
  U extends BFChainUtil.TranslatedErrorCodeListMap = BFChainUtil.TranslatedErrorCodeListMap
> {
  private __lang: I18N_LANGUAGE_TYPE;
  private __store = new Map<
    string,
    {
      sourceErrorCodeList: T;
      translatedErrorCodeListMap: U;
    }
  >();

  constructor(
    @Inject(ERROR_CODE_LANG, { optional: true })
    lang: I18N_LANGUAGE_TYPE = I18N_LANGUAGE_TYPE.ENGLISH
  ) {
    this.__checkLanguage(lang);
    this.__lang = lang;
  }

  static from(lang: I18N_LANGUAGE_TYPE, moduleMap = new ModuleStroge()) {
    return Resolve(
      I18N,
      moduleMap.installMask(new ModuleStroge([[ERROR_CODE_LANG, lang]]))
    );
  }

  private __checkLanguage(lang: I18N_LANGUAGE_TYPE) {
    if (
      lang !== I18N_LANGUAGE_TYPE.CHINESE &&
      lang !== I18N_LANGUAGE_TYPE.ENGLISH
    ) {
      throw new Error(`Invalid lang type ${lang}`);
    }
  }

  getErrorCodeList(uuid: string) {
    const errorCodeList = this.__store.get(uuid);
    if (!errorCodeList) {
      throw new Error(`Failed to get error code list by ${uuid}`);
    }
    return errorCodeList.sourceErrorCodeList;
  }

  formatErrorCodeList(sourceErrorCodeList: T, translatedErrorCodeListMap: U) {
    const errorCodeList = translatedErrorCodeListMap.get(this.__lang);
    if (!errorCodeList) {
      console.debug(
        `Translated error code list not found, language ${this.__lang}`
      );
      return sourceErrorCodeList;
    }
    for (const key in sourceErrorCodeList) {
      const errorInfo = sourceErrorCodeList[key];
      errorInfo.message = errorCodeList[errorInfo.code] || errorInfo.message;
    }
    return sourceErrorCodeList;
  }

  addErrorCodeList(
    uuid: string,
    sourceErrorCodeList: T,
    translatedErrorCodeListMap: U
  ) {
    this.formatErrorCodeList(sourceErrorCodeList, translatedErrorCodeListMap);
    this.__store.set(uuid, {
      sourceErrorCodeList,
      translatedErrorCodeListMap,
    });
  }

  setLanguage(newLang: I18N_LANGUAGE_TYPE) {
    if (this.__lang === newLang) {
      return;
    }
    this.__checkLanguage(newLang);
    this.__lang = newLang;
    for (const {
      sourceErrorCodeList,
      translatedErrorCodeListMap,
    } of this.__store.values()) {
      this.formatErrorCodeList(sourceErrorCodeList, translatedErrorCodeListMap);
    }
  }
}
