declare module '@testing-library/jest-dom' {
  global {
    namespace jest {
      interface Matchers<R> {
        toBeInTheDocument(): R
        toHaveAttribute(attr: string, value?: string): R
        toHaveClass(...classNames: string[]): R
        toHaveStyle(css: string | object): R
        toHaveTextContent(text: string | RegExp): R
        toBeVisible(): R
        toBeEmpty(): R
        toBeDisabled(): R
        toBeEnabled(): R
        toBeInvalid(): R
        toBeRequired(): R
        toBeValid(): R
        toContainElement(element: HTMLElement | null): R
        toContainHTML(html: string): R
        toHaveAccessibleDescription(text?: string | RegExp): R
        toHaveAccessibleName(text?: string | RegExp): R
        toHaveFocus(): R
        toHaveFormValues(values: { [key: string]: any }): R
        toHaveValue(value: string | string[] | number): R
        toBeChecked(): R
        toBePartiallyChecked(): R
        toHaveDisplayValue(value: string | string[] | RegExp): R
      }
    }
  }
}
