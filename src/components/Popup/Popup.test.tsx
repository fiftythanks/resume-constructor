import { render } from 'vitest-browser-react';

import Popup from './Popup';

import type { PopupProps } from './Popup';

/**
 * Since `Popup` is portalled to `popup-root`, there must exist an
 * element with such an ID.
 */
function Container() {
  return <div id="popup-root" />;
}

function getProps(overrides?: Partial<PopupProps>): PopupProps {
  return {
    children: <div />,
    id: 'some-id',
    isShown: true,
    onClose: () => {},
    title: 'Some Title',
    ...overrides,
  };
}

describe('Popup', () => {
  it('should render a heading with text from its `title` prop', async () => {
    await render(<Container />);
    const screen = await render(<Popup {...getProps()} />);

    const heading = screen.getByRole('heading', { name: 'Some Title' });

    await expect.element(heading).toBeInTheDocument();
  });

  it('should render with an accessible name from its heading', async () => {
    await render(<Container />);
    const screen = await render(<Popup {...getProps()} />);

    const popup = screen.getByRole('dialog', { name: 'Some Title' });

    await expect.element(popup).toBeInTheDocument();
  });

  it("shouldn't render if `isShown === false`", async () => {
    await render(<Container />);
    const screen = await render(<Popup {...getProps({ isShown: false })} />);

    const popup = screen.getByRole('dialog', { name: 'Some Title' });

    await expect.element(popup).not.toBeInTheDocument();
  });
});
