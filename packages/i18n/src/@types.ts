declare namespace BFChainUtil {
  type SourceErrorCodeList = {
    [key: string]: BFChainUtil.ErrorCode<string, string>;
  };

  type TranslatedErrorCodeListMap = Map<string, { [key: string]: string }>;

  type I18N_LANGUAGE_TYPE = import("./i18n").I18N_LANGUAGE_TYPE;
}
