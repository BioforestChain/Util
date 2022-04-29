export interface IPackages {
  name: string;
  index: string;
  deps?: string[];
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  peerDependencies?: Dependencies;
  [key: string]: any;
}
type Dependencies = {
  [name: string]: string;
};
