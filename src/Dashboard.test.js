import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

jest.mock('axios');

test('renders Dashboard title', () => {
  render(<Dashboard />);
  const titleElement = screen.getByText(/NYC Yellow Taxi Dashboard/i);
  expect(titleElement).toBeInTheDocument();
});
