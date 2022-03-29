import {
  DirtyInjectProp,
  Inject,
  Injectable,
  ModuleStroge,
  Resolve,
} from "@bfchain/util-dep-inject";
import { A } from "./a.test";

@Injectable()
export class B {
  @DirtyInjectProp(() => A)
  readonly a!: A;
}
