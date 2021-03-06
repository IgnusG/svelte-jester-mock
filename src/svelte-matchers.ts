type SvelteProps = { props: { [key: string]: any }};

declare global {
  namespace jest {
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
}

import diff from 'jest-diff';
import type { MockedComponent, WrappedMockedComponent } from './svelte-mock-factory';

const collapseSvelteProps = (component: MockedComponent): SvelteProps['props'] => {
  const lastCall = component.mock.calls.length - 1;
  const initialProps = component.mock.calls[lastCall][0] as SvelteProps;

  return component.$set$spy.mock.calls.reduce((result, [newProps]) => ({
    ...result,
    ...newProps,
  }), initialProps.props);
}

const isWrapped = (component: WrappedMockedComponent | MockedComponent): component is WrappedMockedComponent => (component as WrappedMockedComponent)?.default !== undefined;

expect.extend({
  toHaveSvelteProp(component: WrappedMockedComponent, propName: string, propValue: any) {
    const props = collapseSvelteProps(isWrapped(component) ? component.default : component);

    const prop = props[propName];

    const pass = this.isNot ? prop === undefined : JSON.stringify(prop) === JSON.stringify(propValue);

    const message = pass
      ? () => this.utils.matcherHint('.not.toHaveSvelteProp') + '\n\n' +
        `Expected Svelte component to not have the prop ${propName}:\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(prop)}`
      : () => {
        const diffString = diff(propValue, prop, {
          expand: this.expand,
        });
        return this.utils.matcherHint('.toHaveSvelteProp') + '\n\n' +
        `Expected Svelte component to have prop ${propName} with value:\n` +
        `  ${this.utils.printExpected(propValue)}\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(prop)}` +
        (diffString ? `\n\nDifference:\n\n${diffString}` : '');
      };

    return { actual: props, message, pass };
  },
  toHaveSvelteProps(component: MockedComponent, expectedProps: SvelteProps['props']) {
    const props = collapseSvelteProps(isWrapped(component) ? component.default : component);

    const expectedPropEntries = Object.entries(expectedProps);
    const expectedPropKeys = expectedPropEntries.map(([key]) => key);

    const filteredProps = Object.entries(props).reduce((result, [key, value]) => ({
      ...result,
      ...(expectedPropKeys.includes(key) ? { [key]: value } : {})
    }), {})

    const pass = Object.entries(filteredProps).every(([key, value]) => {
      const serialValue = JSON.stringify(value);
      const expectedSerialValue = JSON.stringify(expectedProps[key]);

      const equivalent = serialValue === expectedSerialValue;

      return this.isNot ? !equivalent : equivalent;
    });

    const message = pass
      ? () => this.utils.matcherHint('.not.toHaveSvelteProps') + '\n\n' +
        `Expected Svelte component not to have props:\n` +
        `  ${this.utils.printExpected(expectedProps)}\n` +
        `Received (props were filtered to only include expected keys):\n` +
        `  ${this.utils.printReceived(filteredProps)}`
      : () => {
        const diffString = diff(expectedProps, filteredProps, {
          expand: this.expand,
        });
        return this.utils.matcherHint('.toHaveSvelteProps') + '\n\n' +
        `Expected Svelte component to have props:\n` +
        `  ${this.utils.printExpected(expectedProps)}\n` +
        `Received (props were filtered to only include expected keys):\n` +
        `  ${this.utils.printReceived(filteredProps)}` +
        (diffString ? `\n\nDifference:\n\n${diffString}` : '');
      };

    return { actual: props, message, pass };
  },
});
