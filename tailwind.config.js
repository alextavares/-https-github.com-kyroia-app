const config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'var(--font-sans)',
                    '"DM Sans"',
                    'Inter',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    "'Segoe UI'",
                    'Roboto',
                    'Oxygen',
                    'Ubuntu',
                    'Cantarell',
                    '"Open Sans"',
                    '"Helvetica Neue"',
                    'sans-serif',
                ],
                'dm-sans': ['"DM Sans"', 'sans-serif'],
            },
            colors: {
                // Cores customizadas do Kyroia
                primary: {
                    DEFAULT: 'var(--primary)',
                    hover: 'var(--primaryHover)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    hover: 'var(--secondaryHover)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    hover: 'var(--accentHover)',
                },
                background: {
                    DEFAULT: 'var(--background)',
                    secondary: 'var(--backgroundSecondary)',
                    tertiary: 'var(--backgroundTertiary)',
                },
                text: {
                    primary: 'var(--textPrimary)',
                    secondary: 'var(--textSecondary)',
                    tertiary: 'var(--textTertiary)',
                },
                border: {
                    DEFAULT: 'var(--border)',
                    hover: 'var(--borderHover)',
                },
                // Manter cores originais para compatibilidade
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                }
            },
            backgroundImage: {
                'surface': 'var(--surface)',
                'surface-hover': 'var(--surfaceHover)',
                'card': 'var(--cardBackground)',
                'card-hover': 'var(--cardHover)',
            },
            boxShadow: {
                'soft': 'var(--shadow)',
                'soft-md': 'var(--shadowMd)',
                'soft-lg': 'var(--shadowLg)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            }
        }
    },
    plugins: [],
};
export default config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFpbHdpbmQuY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGFpbHdpbmQuY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sTUFBTSxHQUFXO0lBQ3JCLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUNuQixPQUFPLEVBQUU7UUFDUCxrQ0FBa0M7UUFDbEMsdUNBQXVDO1FBQ3ZDLGdDQUFnQztLQUNqQztJQUNELEtBQUssRUFBRTtRQUNOLE1BQU0sRUFBRTtZQUNQLE1BQU0sRUFBRTtnQkFDUCxpQ0FBaUM7Z0JBQ2pDLE9BQU8sRUFBRTtvQkFDUixPQUFPLEVBQUUsZ0JBQWdCO29CQUN6QixLQUFLLEVBQUUscUJBQXFCO2lCQUM1QjtnQkFDRCxTQUFTLEVBQUU7b0JBQ1YsT0FBTyxFQUFFLGtCQUFrQjtvQkFDM0IsS0FBSyxFQUFFLHVCQUF1QjtpQkFDOUI7Z0JBQ0QsTUFBTSxFQUFFO29CQUNQLE9BQU8sRUFBRSxlQUFlO29CQUN4QixLQUFLLEVBQUUsb0JBQW9CO2lCQUMzQjtnQkFDRCxVQUFVLEVBQUU7b0JBQ1gsT0FBTyxFQUFFLG1CQUFtQjtvQkFDNUIsU0FBUyxFQUFFLDRCQUE0QjtvQkFDdkMsUUFBUSxFQUFFLDJCQUEyQjtpQkFDckM7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLE9BQU8sRUFBRSxvQkFBb0I7b0JBQzdCLFNBQVMsRUFBRSxzQkFBc0I7b0JBQ2pDLFFBQVEsRUFBRSxxQkFBcUI7aUJBQy9CO2dCQUNELE1BQU0sRUFBRTtvQkFDUCxPQUFPLEVBQUUsZUFBZTtvQkFDeEIsS0FBSyxFQUFFLG9CQUFvQjtpQkFDM0I7Z0JBQ0QsOENBQThDO2dCQUM5QyxVQUFVLEVBQUUsd0JBQXdCO2dCQUNwQyxJQUFJLEVBQUU7b0JBQ0wsT0FBTyxFQUFFLGtCQUFrQjtvQkFDM0IsVUFBVSxFQUFFLDZCQUE2QjtpQkFDekM7Z0JBQ0QsT0FBTyxFQUFFO29CQUNSLE9BQU8sRUFBRSxxQkFBcUI7b0JBQzlCLFVBQVUsRUFBRSxnQ0FBZ0M7aUJBQzVDO2dCQUNELEtBQUssRUFBRTtvQkFDTixPQUFPLEVBQUUsbUJBQW1CO29CQUM1QixVQUFVLEVBQUUsOEJBQThCO2lCQUMxQztnQkFDRCxXQUFXLEVBQUU7b0JBQ1osT0FBTyxFQUFFLHlCQUF5QjtvQkFDbEMsVUFBVSxFQUFFLG9DQUFvQztpQkFDaEQ7Z0JBQ0QsS0FBSyxFQUFFLG1CQUFtQjtnQkFDMUIsSUFBSSxFQUFFLGtCQUFrQjtnQkFDeEIsS0FBSyxFQUFFO29CQUNOLEdBQUcsRUFBRSxxQkFBcUI7b0JBQzFCLEdBQUcsRUFBRSxxQkFBcUI7b0JBQzFCLEdBQUcsRUFBRSxxQkFBcUI7b0JBQzFCLEdBQUcsRUFBRSxxQkFBcUI7b0JBQzFCLEdBQUcsRUFBRSxxQkFBcUI7aUJBQzFCO2dCQUNELE9BQU8sRUFBRTtvQkFDUixPQUFPLEVBQUUsZ0NBQWdDO29CQUN6QyxVQUFVLEVBQUUsZ0NBQWdDO29CQUM1QyxPQUFPLEVBQUUsNkJBQTZCO29CQUN0QyxvQkFBb0IsRUFBRSx3Q0FBd0M7b0JBQzlELE1BQU0sRUFBRSw0QkFBNEI7b0JBQ3BDLG1CQUFtQixFQUFFLHVDQUF1QztvQkFDNUQsTUFBTSxFQUFFLDRCQUE0QjtvQkFDcEMsSUFBSSxFQUFFLDBCQUEwQjtpQkFDaEM7YUFDRDtZQUNELGVBQWUsRUFBRTtnQkFDaEIsU0FBUyxFQUFFLGdCQUFnQjtnQkFDM0IsZUFBZSxFQUFFLHFCQUFxQjtnQkFDdEMsTUFBTSxFQUFFLHVCQUF1QjtnQkFDL0IsWUFBWSxFQUFFLGtCQUFrQjthQUNoQztZQUNELFNBQVMsRUFBRTtnQkFDVixNQUFNLEVBQUUsZUFBZTtnQkFDdkIsU0FBUyxFQUFFLGlCQUFpQjtnQkFDNUIsU0FBUyxFQUFFLGlCQUFpQjthQUM1QjtZQUNELFlBQVksRUFBRTtnQkFDYixFQUFFLEVBQUUsZUFBZTtnQkFDbkIsRUFBRSxFQUFFLDJCQUEyQjtnQkFDL0IsRUFBRSxFQUFFLDJCQUEyQjthQUMvQjtTQUNEO0tBQ0Q7SUFDRCxPQUFPLEVBQUUsRUFBRTtDQUNaLENBQUM7QUFFRixlQUFlLE1BQU0sQ0FBQyJ9
