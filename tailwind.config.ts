import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '1rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif',
  				'Apple Color Emoji',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'Noto Color Emoji'
  			],
  			serif: [
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			],
  			mono: [
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
		colors: {
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			ink: 'hsl(var(--ink))',
			// RSC Brand Colors
			rsc: {
				sky: 'hsl(var(--rsc-sky))',
				gold: 'hsl(var(--rsc-gold))',
				'gold-light': 'hsl(var(--rsc-gold-light))',
				'gold-deep': 'hsl(var(--rsc-gold-deep))',
				mint: 'hsl(var(--rsc-mint))',
				coral: 'hsl(var(--rsc-coral))',
				bg: 'hsl(var(--rsc-bg))',
				ink: 'hsl(var(--rsc-ink))',
			},
			primary: {
				DEFAULT: 'hsl(var(--primary))',
				700: 'hsl(var(--primary-700))',
				foreground: 'hsl(var(--primary-foreground))'
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))'
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			danger: 'hsl(var(--destructive))',
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))'
			},
			success: {
				DEFAULT: 'hsl(var(--success))',
				foreground: 'hsl(var(--success-foreground))'
			},
			coin: {
				DEFAULT: 'hsl(var(--coin))',
				2: 'hsl(var(--coin-2))',
				deep: 'hsl(var(--rsc-gold-deep))'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))'
			},
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))'
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
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 4px)',
  			sm: 'calc(var(--radius) - 8px)',
  			xl: 'calc(var(--radius) + 4px)',
  			'2xl': 'calc(var(--radius) + 8px)',
  			'3xl': 'calc(var(--radius) + 16px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'coin-bounce': {
  				'0%, 100%': {
  					transform: 'translateY(0) scale(1)'
  				},
  				'50%': {
  					transform: 'translateY(-8px) scale(1.05)'
  				}
  			},
  			'coin-spin': {
  				'0%': {
  					transform: 'rotateY(0deg)'
  				},
  				'100%': {
  					transform: 'rotateY(360deg)'
  				}
  			},
  			'check-pop': {
  				'0%': {
  					transform: 'scale(0)'
  				},
  				'50%': {
  					transform: 'scale(1.3)'
  				},
  				'100%': {
  					transform: 'scale(1)'
  				}
  			},
  			'sparkle': {
  				'0%, 100%': {
  					opacity: '0',
  					transform: 'scale(0.5)'
  				},
  				'50%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'wiggle': {
  				'0%, 100%': {
  					transform: 'rotate(-3deg)'
  				},
  				'50%': {
  					transform: 'rotate(3deg)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'coin-bounce': 'coin-bounce 0.6s ease-in-out',
  			'coin-spin': 'coin-spin 0.8s ease-in-out',
  			'check-pop': 'check-pop 0.3s ease-out',
  			'sparkle': 'sparkle 0.6s ease-in-out',
  			'slide-up': 'slide-up 0.4s ease-out',
  			'wiggle': 'wiggle 0.3s ease-in-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
