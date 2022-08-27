import Styled from 'vue3-styled-components';
import { media } from './media';

const props = [];

const Wrapper = Styled('div', props)`
	font-family: ${(props) => props.theme.fonts.fontStack};
	color: ${(props) => props.theme.colors.textColor};
	font-size: ${(props) => props.theme.fonts.mediumText};
	box-sizing: border-box;

	*,
	*:before,
	*:after {
		box-sizing: inherit;
	};
`;

const Required = Styled('span', props)`
  color: ${(props) => props.theme.colors.danger};
  padding-right: 3px;
`;

const Error = Styled('div', props)`
  color: ${(props) => props.theme.colors.danger};
  font-size: ${(props) => props.theme.fonts.smallText};
`;

const FieldWrapper = Styled('div', props)`
  margin-bottom: 15px;
`;

const Label = Styled('label', props)`
  display: block;
  margin-bottom: 3px;
`;

const Input = Styled('input', props)`
  padding: 10px;
  border-radius: ${(props) => props.theme.radius.input};
  width: 100%;
  border-color: ${(props) =>
		props.hasError ? props.theme.colors.danger : props.theme.colors.primary};
  outline-color: ${(props) =>
		props.hasError ? props.theme.colors.danger : props.theme.colors.primary};
`;

const Button = Styled('button', props)`
  padding: 15px 10px;
  width: ${(props) => (props.style?.width ? props.style.width : '100%')};
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 375;
  max-height: 64px;
  background-color: ${(props) =>
		props.appearance === ButtonAppearance.Primary
			? props.theme.colors.primary
			: '#ffffff'};
  color: ${(props) =>
		props.appearance === ButtonAppearance.Default
			? props.theme.colors.textColor
			: '#ffffff'};
  border-radius: ${(props) => props.theme.radius.button};
  border-color: ${(props) => props.theme.colors.textColor};
  border: ${(props) =>
		props.appearance === ButtonAppearance.Primary ? '0px' : '1px'};
  border-style: solid;
  cursor: pointer;
  position: relative;

  &:disabled {
    cursor: not-allowed;
    background-color: ${(props) => props.theme.colors.primaryDisabled};
  }

  svg {
    position: absolute;
    left: 10px;
  }
`;

const Link = Styled('span', props)`
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
`;

const Separator = Styled('div', props)`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 10px 0px;

  ::before {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${(props) => props.theme.colors.gray};
  }

  ::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${(props) => props.theme.colors.gray};
  }

  :not(:empty)::before {
    margin-right: 0.25em;
  }

  :not(:empty)::after {
    margin-left: 0.25em;
  }
`;

const Footer = Styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
`;

const MessageWrapper = Styled('div', props)`
  padding: 10px;
  color: white;
  border-radius: ${(props) => props.theme.radius.card};
  margin: 10px 0px;
  font-size: ${(props) => props.theme.fonts.smallText};
  ${(props) =>
		props.type === 'error' &&
		`
    background-color: ${props.theme.colors.danger};
  `}
  ${(props) =>
		props.type === 'success' &&
		`
    background-color: ${props.theme.colors.success};
  `};
`;

const Flex = Styled('div', props)`
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

export {
	Wrapper,
	Required,
	Error,
	FieldWrapper,
	Label,
	Input,
	Button,
	Link,
	Separator,
	Footer,
	MessageWrapper,
	Flex,
};
