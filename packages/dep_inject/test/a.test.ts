import {
  DirtyInjectProp,
  Inject,
  Injectable,
  ModuleStroge,
  Resolve,
} from "@bfchain/util-dep-inject";
import { B } from "./b.test";

@Injectable()
export class A {
  @DirtyInjectProp(() => B)
  readonly b!: B;
}

const a = Resolve(A, new ModuleStroge());
console.log(a.b, a.b.a == a);
