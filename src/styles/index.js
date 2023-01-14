import Styled, { css } from 'vue3-styled-components';
import { media } from './media';
import { theme } from './theme';
import { passwordStrengthIndicatorOpacity } from '../constants/index';

const props = [];

const StyledFormGroup = Styled('div', props)`
  width: 100%;
  border: 0px;
  background-color: #ffffff;
  padding: 0 0 15px;
  .form-input-label{
    padding: 2.5px;
    span {
      color: red;
    }
  }
  .form-input-field{
    width: 100%;
    margin-top: 5px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: ${theme.radius.input};
    border: 1px;
    border-style: solid;
    border-color: ${(props) =>
			props.hasError ? theme.colors.danger : theme.colors.textColor};
    :focus {
      ${(props) => props.hasError && `outline-color: ${theme.colors.danger}`};
    }
  }
  .form-input-error {
    font-size: 12px;
    font-weight: 400;
    color: red;
  }
`;

export { StyledFormGroup };
