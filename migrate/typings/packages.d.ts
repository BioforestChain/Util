export interface IPackages {
  packageName: string;
  index: string;
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  peerDependencies?: Dependencies;
}
type Dependencies = {
  [name: string]: string;
};
