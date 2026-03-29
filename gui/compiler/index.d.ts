export interface GuiTemplateCompilerOptions {
  tags?: string[];
  include?: RegExp;
  exclude?: RegExp;
  id?: string;
}

export interface GuiTemplateTransformResult {
  code: string;
  changed: boolean;
}

export declare function transformGuiTemplates(
  source: string,
  options?: GuiTemplateCompilerOptions,
): GuiTemplateTransformResult;

export declare function guiVitePlugin(options?: GuiTemplateCompilerOptions): {
  name: string;
  enforce: "pre";
  transform(source: string, id: string): null | { code: string; map: null };
};

export declare function guiEsbuildPlugin(options?: GuiTemplateCompilerOptions): {
  name: string;
  setup(build: {
    onLoad(
      options: { filter: RegExp },
      callback: (args: { path: string }) => unknown,
    ): void;
  }): void;
};
