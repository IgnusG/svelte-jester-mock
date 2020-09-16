/// <reference types="jest" />

interface MockedComponent extends jest.Mock {
  $set$spy: jest.Mock;
}

type SvelteProps = { props: { [key: string]: any }};


declare namespace jest {
  interface Matchers<R, T> {
    /**
     * @description
     * Assert whether a svelte component has the specified prop (compares as .toEqual(...)).
     * @example
     * <Component value={15}/>
     *
     * expect(ComponentMock).toHaveSvelteProp('value', 15)
     */
    toHaveSvelteProp(propName: string, propValue: any): R;
    /**
     * @description
     * Assert whether a svelte component has all the provided props (compares as .toEqual(expect.objectContaining({ ... }))).
     * @example
     * <Component value={15} text="Hello" color="blue"/>
     *
     * expect(ComponentMock).toHaveSvelteProps({ value: 15, text: "Hello" })
     */
    toHaveSvelteProps(expectedProps: SvelteProps['props']): R;
  }
}

