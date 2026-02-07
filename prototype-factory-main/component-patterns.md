# Component Patterns

Reusable component patterns based on the Kaluza design system.

## Component Architecture

All components follow a consistent structure:
- Built on Material-UI foundation
- Custom Kaluza theme extensions
- TypeScript for type safety
- Styled with makeStyles or styled-components
- Responsive by default

## Core Components

### Button

**Variants**: outlined, contained, text

**Pattern**:
```tsx
interface ButtonProps {
  variant?: 'outlined' | 'contained' | 'text';
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}

// Styling characteristics:
// - Uppercase text
// - Border radius: 2rem (pill shape)
// - Letter spacing: 0.09rem
// - Padding: 8px 16px
// - Outlined: transparent bg, primary border
// - Contained: primary bg, white text
// - Disabled: 30% opacity
```

**Usage**:
```tsx
<Button variant="contained" onClick={handleClick}>
  Submit
</Button>

<Button variant="outlined">
  Cancel
</Button>
```

### Typography

**Components**: Typography, PageTitle, Subtitle, BodyText

**Pattern**:
```tsx
interface TypographyProps {
  component?: React.ElementType;
  baseSize?: SizeVariation;
  smallSize?: SizeVariation;   // 480px+
  mediumSize?: SizeVariation;  // 768px+
  largeSize?: SizeVariation;   // 1280px+
  xLargeSize?: SizeVariation;  // 1920px+
  children: ReactNode;
}

// PageTitle: h1, x10 → x11, medium weight
// Subtitle: h2, x08 → x09, uppercase, regular weight
// BodyText: p, x04 → x05
```

**Usage**:
```tsx
<PageTitle>Dashboard Overview</PageTitle>
<Subtitle>Recent Activity</Subtitle>
<BodyText>Your recent transactions...</BodyText>

<Typography 
  component="h3" 
  baseSize={SizeVariation.x06}
  mediumSize={SizeVariation.x08}
>
  Custom heading
</Typography>
```

### Form Controls

#### TextInput
```tsx
interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
}

// Styling:
// - Background: Envy 100
// - Border: subtle, increases on focus
// - Error state: Cherry color
```

#### Select
```tsx
interface SelectProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}
```

#### Checkbox
```tsx
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}
```

#### Radio
```tsx
interface RadioProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  name: string;
}
```

#### Switch
```tsx
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}
```

### Layout Components

#### Accordion
```tsx
interface AccordionProps {
  items: Array<{
    title: string;
    content: ReactNode;
    defaultExpanded?: boolean;
  }>;
}
```

#### Drawer
```tsx
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  children: ReactNode;
}
```

#### Modal
```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}
```

### Feedback Components

#### Alert
```tsx
interface AlertProps {
  severity: 'error' | 'warning' | 'info' | 'success';
  message: string;
  onClose?: () => void;
}

// Colors:
// - error: Cherry
// - success: Avocado
// - warning: Lemon
// - info: Aqua
```

#### Spinner
```tsx
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
}
```

#### Skeleton
```tsx
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}
```

#### LoadingBar
```tsx
interface LoadingBarProps {
  loading: boolean;
  color?: 'primary' | 'secondary';
}
```

### Data Display

#### Table
```tsx
interface TableProps {
  columns: Array<{
    id: string;
    label: string;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
  }>;
  rows: Array<Record<string, any>>;
  onSort?: (columnId: string) => void;
  pagination?: {
    page: number;
    rowsPerPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
  };
}
```

#### List
```tsx
interface ListProps {
  items: Array<{
    id: string;
    primary: string;
    secondary?: string;
    icon?: ReactNode;
    onClick?: () => void;
  }>;
  subheader?: string;
}
```

#### Avatar
```tsx
interface AvatarProps {
  src?: string;
  alt?: string;
  children?: string; // Initials
  size?: 'small' | 'medium' | 'large';
}
```

### Navigation

#### Breadcrumbs
```tsx
interface BreadcrumbsProps {
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
}
```

#### Toolbar
```tsx
interface ToolbarProps {
  title?: string;
  actions?: ReactNode;
  children?: ReactNode;
}
```

### Advanced Components

#### DatePicker
```tsx
interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}
```

#### RangeSlider
```tsx
interface RangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
}
```

#### Autoselect
```tsx
interface AutoselectProps {
  options: Array<{ value: string; label: string }>;
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  freeSolo?: boolean;
}
```

#### TreeCheckboxSelector
```tsx
interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface TreeCheckboxSelectorProps {
  data: TreeNode[];
  selected: string[];
  onChange: (selected: string[]) => void;
}
```

## Platform Components

### GlobalHeader
```tsx
interface GlobalHeaderProps {
  logo?: ReactNode;
  navigation?: ReactNode;
  userNav?: ReactNode;
}
```

### PlatformHeader
```tsx
interface PlatformHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}
```

### Nav
```tsx
interface NavProps {
  items: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
    active?: boolean;
  }>;
}
```

### UserNav
```tsx
interface UserNavProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  menuItems: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>;
}
```

## Component Composition Patterns

### Form Pattern
```tsx
<form>
  <TextInput label="Email" type="email" />
  <TextInput label="Password" type="password" />
  <FormHelperText>Password must be 8+ characters</FormHelperText>
  <ButtonGroup>
    <Button variant="contained">Submit</Button>
    <Button variant="outlined">Cancel</Button>
  </ButtonGroup>
</form>
```

### Card Pattern
```tsx
<Card>
  <CardHeader>
    <Typography component="h3">Card Title</Typography>
  </CardHeader>
  <CardContent>
    <BodyText>Card content goes here</BodyText>
  </CardContent>
  <CardActions>
    <Button>Action</Button>
  </CardActions>
</Card>
```

### Dashboard Panel Pattern
```tsx
<Panel>
  <Toolbar title="Panel Title">
    <IconButton icon="refresh" onClick={handleRefresh} />
  </Toolbar>
  <PanelContent>
    {loading ? <Skeleton /> : <DataDisplay />}
  </PanelContent>
</Panel>
```

## Styling Patterns

### Using Theme
```tsx
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.kaluza.colors.colorRoles.pageBackground,
    color: theme.kaluza.colors.colorRoles.textPrimary,
    padding: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(4)
    }
  }
}));
```

### Custom Component Pattern
```tsx
import { makeStyles } from '@material-ui/core';
import { kaluzaColors, SizeVariation, spacing } from '../theme';

interface CustomComponentProps {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: spacing(2),
    borderRadius: '8px',
    fontSize: SizeVariation.x05
  },
  primary: {
    backgroundColor: kaluzaColors.envyColors[500],
    color: kaluzaColors.additionalColors.white
  },
  secondary: {
    backgroundColor: kaluzaColors.waferColors[500],
    color: kaluzaColors.additionalColors.white
  }
}));

export const CustomComponent = ({ 
  variant = 'primary', 
  children 
}: CustomComponentProps) => {
  const classes = useStyles();
  
  return (
    <div className={`${classes.root} ${classes[variant]}`}>
      {children}
    </div>
  );
};
```

## Best Practices

1. **Composition over Configuration**: Build complex UIs by composing simple components
2. **Responsive by Default**: Use responsive size props and breakpoints
3. **Accessible**: Include proper ARIA labels and keyboard navigation
4. **Type Safe**: Use TypeScript interfaces for all props
5. **Theme Aware**: Always use theme values instead of hardcoded colors/sizes
6. **Consistent Spacing**: Use the spacing function for all margins and padding
7. **Error States**: Always handle loading, error, and empty states
8. **Performance**: Use React.memo for expensive components
