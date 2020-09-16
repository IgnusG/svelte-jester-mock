import type { SvelteComponent } from 'svelte/internal';

export interface MockedComponent extends jest.Mock {
  $set$spy: jest.Mock;
}

/**
 * @description
 * Creates a mocked svelte component which can then be imported like normal and used with matchers provided by svelte-jester-mock
 * @example
 * jest.mock('my-component/path', mockComponent(require('mocks/component.svelte'));
 *
 * import Component from 'my-component/path';
 * const componentMock = Component.default as MockedComponent;
 * ...
 *
 * expect(componentMock).toHaveSvelteProp('value', 123);
 */
export function mockComponent(component: SvelteComponent): {
	['default']: MockedComponent
} {
	const setSpy = jest.fn();

  const mockComponent = jest.fn(function(...args) {
    // @ts-expect-error // This initializes svelte components properly
    const instance = new component(...args)

    return new Proxy(instance, {
      get(target, props, receiver) {
        if (props === '$set') {
          return setSpy;
        }

        return Reflect.get(target, props, receiver);
      },
    });
  }) as MockedComponent;

  Object.assign(mockComponent, {'$set$spy': setSpy});

  return {
    default: mockComponent,
  };
}