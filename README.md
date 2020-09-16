## Svelte Jester - Mock

This package is a simple helper to make your Svelte unit tests more readable and reduce their boiler plate.

### Disclaimer!

I had some trouble testing components since I started learning svelte a week ago. I did not find another mocking solution which would work with my setup:
- Typescript preprocessor in Svelte enabled
- All compilation done via `babel-jest` (ts files as well)
- Clean tests with minimal clutter (no component prop render trickery - couldn't believe that worked though...)

As such this package came out of an idea and 3 hours of coding. It might contain bugs. Complicated components might break. Other setups might break. Honestly your computer might literally catch on fire - who knows.

But that's where the beauty of OSS comes into play. If you have any issues, suggestions, improvements etc.:
- Feel free to open an issue (I will read it)
- Feel free to open a PR (I will review them)
- Feel free to fork this repository and explore an alternative solution for yourself

## Setup
Import `svelte-jester-mock/dist/extend-jest` in your `setupFilesAfterEnv` file. So if your jest configuration (external or in `package.json`) looks like this:
```json
"jest": {
    "setupFilesAfterEnv": [
      "./prepare-jest.ts"
    ]
}
```

Import it the file you reference:
```typescript
import 'svelte-jester-mock/dist/extend-jest';
```

> Be sure the file is a typescript file and you include it in your `tsconfig.json` otherwise the types won't be picked up

## How do I use this?
If you use a mock component (eg. `mock.svelte`) for testing like so:
```svelte
<div>This is a mock<div>
```

And you have a let's say a `ParentComponent` (`parent-component.svelte`):
```svelte
<script>
import Component from 'component-to-mock.svelte';

export let value = 5;
</script>

<Component value={value + 2}>
```

You can mock the component with this library to test `ParentComponent` in isolation (`Component` could be one of your components or an external component).

```typescript
jest.mock('component-to-mock.svelte', () => {
    const component = require('mock.svelte');
    const mock = require('svelte-jester-mock').mockComponent(component);

    return mock;
});

import {render} from '@testing-library/svelte';

import Component from 'component-to-mock.svelte';
import ParentComponent from 'parent-component.svelte';

// Don't forget to clear the mock (the component is wrapped so be sure to type Component.default to access any mock information)
beforeEach(() => Component.default.mockClear());

test("component renders", () => {
    render(ParentComponent);
    expect(Component).toHaveSvelteProp('value', 7);
});
```

If you don't want to create a separate mock component for tests (maybe you'd like to include some text to be able to check if it renders), you can use `svelte-htm` instead:

```typescript
jest.mock('component-to-mock.svelte', () => {
    const html = require('svelte-htm');
    const component = html`<div>My Awesome Mock</div>`;
    const mock = require('svelte-jester-mock').mockComponent(component);

    return mock;
});

...

test("component renders", () => {
    const { getByText } = render(ParentComponent);

    expect(getByText('My Awesome Mock')).toBeInTheDocument();
    expect(Component).toHaveSvelteProp('value', 7);
});
```

> I assume `svelte-jsx` works too - haven't tried it though
