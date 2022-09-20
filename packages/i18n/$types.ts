import { $ErrorCode } from "../exception-error-code/$types.ts";

export type $SourceErrorCodeList = {
  [key: string]: $ErrorCode<string, string>;
};

export type $TranslatedErrorCodeListMap = Map<
  string,
  { [key: string]: string }
>;
