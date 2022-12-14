import Styled, { css } from 'vue3-styled-components';
import { media } from './media';
import { theme } from './theme';
import { passwordStrengthIndicatorOpacity } from '../constants/index';

const props = [];

const StyledWrapper = Styled('div')`
	font-family: ${theme.fonts.fontStack};
	color: ${theme.colors.textColor};
	font-size: ${theme.fonts.mediumText};
	box-sizing: border-box;

	*,
	*:before,
	*:after {
		box-sizing: inherit;
	};
`;

const StyledButton = Styled('button', props)`
  padding: 15px 10px;
  width: ${(props) => (props.style?.width ? props.style.width : '100%')};
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 375px;
  max-height: 64px;
  background-color: ${(props) =>
		props.appearance === 'Primary' ? theme.colors.primary : '#ffffff'};
  color: ${(props) =>
		props.appearance === 'Default' ? theme.colors.textColor : '#ffffff'};
  border-radius: ${theme.radius.button};
  border-color: ${theme.colors.textColor};
  border: ${(props) => (props.appearance === 'Primary' ? '0px' : '1px')};
  border-style: solid;
  cursor: pointer;
  position: relative;

  &:disabled {
    cursor: not-allowed;
    background-color: ${theme.colors.primaryDisabled};
  }

  svg {
    position: absolute;
    left: 10px;
  }
`;

const StyledLink = Styled('span')`
  color: ${theme.colors.primary};
  cursor: pointer;
`;

const StyledSeparator = Styled('div')`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 10px 0px;

  ::before {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${theme.colors.gray};
  }

  ::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${theme.colors.gray};
  }

  :not(:empty)::before {
    margin-right: 0.25em;
  }

  :not(:empty)::after {
    margin-left: 0.25em;
  }
`;

const StyledFooter = Styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
`;

const StyledMessageWrapper = Styled('div', props)`
  padding: 10px;
  color: white;
  border-radius: ${theme.radius.card};
  margin: 10px 0px;
  font-size: ${theme.fonts.smallText};
  ${(props) =>
		props.type === 'Error' &&
		`
    background-color: ${theme.colors.danger};
  `}
  ${(props) =>
		props.type === 'Success' &&
		`
    background-color: ${theme.colors.success};
  `};
`;

const StyledFlex = Styled('div', props)`
  display: flex;
  flex-direction: ${({ flexDirection, isResponsive }) =>
		isResponsive && flexDirection !== 'column'
			? 'column'
			: flexDirection || 'row'};
  flex-wrap: ${({ wrap }) => wrap || 'wrap'};
  ${({ alignItems }) =>
		alignItems &&
		css`
			align-items: ${alignItems};
		`};
  ${({ justifyContent }) =>
		justifyContent &&
		css`
			justify-content: ${justifyContent};
		`};
  ${media.lg`
    flex-direction: ${({ flexDirection }) => flexDirection || 'row'}
  `}
`;

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

const StyledCheckBoxLabel = Styled('div')`
  margin-left: 5px
`;

const StyledPasswordStrengthWrapper = Styled('div')`
  margin: 2% 0 0;
`;

const StyledPasswordStrength = Styled('div')`
  width: 100%;
  height: 10px;
  flex: 0.75;
  border-radius: 5px;
  margin-right: 5px;
  background-color: ${theme.colors.primary};
  opacity: ${(props) => passwordStrengthIndicatorOpacity[props.strength]};
`;

export {
	StyledWrapper,
	StyledButton,
	StyledLink,
	StyledSeparator,
	StyledFooter,
	StyledMessageWrapper,
	StyledFlex,
	StyledFormGroup,
	StyledCheckBoxLabel,
	StyledPasswordStrengthWrapper,
	StyledPasswordStrength,
};
