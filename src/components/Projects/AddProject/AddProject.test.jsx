import AddProject from './AddProject';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Helper function
const typeIntoInput = ({ input }) => {
  const inputField = screen.getByRole('textbox');

  if (input) {
    userEvent.type(inputField, input);
  }

  return {
    inputField,
  };
};

describe('AddProject component structure', () => {
  beforeEach(() => {
    render(<AddProject />);
  });

  test('it renders correctly', () => {
    expect(screen.getByText('Add new project')).toBeInTheDocument();
  });

  test('input field should initially be empty', () => {
    expect(screen.getByRole('textbox').value).toBe('');
  });

  test('select element should initially have a value of unspecified', () => {
    expect(screen.getByRole('combobox').value).toBe('Unspecified');
  });

  test('button should not be in the document when the input field is empty', () => {
    expect(screen.queryByRole('button')).toBeNull();
  });

  test('user should be able to type in the input field', () => {
    const { inputField } = typeIntoInput({ input: 'New Project Name' });
    expect(inputField.value).toBe('New Project Name');
  });

  test('user should be able to select a category', () => {
    userEvent.selectOptions(screen.getByRole('combobox'), 'Food');
    expect(screen.getByRole('option', { name: 'Food' }).selected).toBe(true);
  });

  test('button should appear when user types in the input field', () => {
    typeIntoInput({ input: '123' });
    expect(screen.queryByRole('button')).not.toBeNull();
  });
});

describe('AddProject component state handlers', () => {
  // Mock the onAddNewProject function
  const mockAddNewProject = jest.fn().mockResolvedValueOnce();

  beforeEach(() => {
    render(<AddProject onAddNewProject={mockAddNewProject} />);
  });

  test('Input change handler updates state correctly', () => {
    const inputField = screen.getByRole('textbox');
    fireEvent.change(inputField, { target: { value: 'New Project' } });
    expect(inputField.value).toBe('New Project');
  });

  test('Select change handler updates state correctly', () => {
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'Food' } });
    expect(selectElement.value).toBe('Food');
  });

  test('Button click handler calls onAddNewProject with correct arguments', async () => {
    const inputField = screen.getByRole('textbox');
    const selectElement = screen.getByRole('combobox');

    // Type into the input field to make the button appear
    fireEvent.change(inputField, { target: { value: 'New Project' } });
    fireEvent.change(selectElement, { target: { value: 'Food' } });

    // Now find the button element
    const buttonElement = screen.getByRole('button');

    // Click the button
    await act(async () => {
      fireEvent.click(buttonElement);
    });

    // Assert that the mock function was called with the correct arguments
    expect(mockAddNewProject).toHaveBeenCalledWith('New Project', 'Food');
  });
});
