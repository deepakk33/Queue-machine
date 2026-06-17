/* @ds-bundle: {"format":3,"namespace":"LinkedInDMQueueDesignSystem_ee8eb0","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"ProspectCard","sourcePath":"components/data/ProspectCard.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"StatusBadge","sourcePath":"components/feedback/StatusBadge.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"}],"sourceHashes":{"components/core/Button.jsx":"e6b87309254c","components/core/IconButton.jsx":"d2130097dd42","components/data/ProspectCard.jsx":"675ad7e41aa4","components/feedback/Dialog.jsx":"a685f3dc039f","components/feedback/ProgressBar.jsx":"7665dbfcec1b","components/feedback/StatusBadge.jsx":"4ef199f61188","components/feedback/Toast.jsx":"fca82a1ca606","components/forms/Input.jsx":"a04107f5ca26","components/forms/Switch.jsx":"ce3def648d7d","components/forms/Textarea.jsx":"7033582e6dcf"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LinkedInDMQueueDesignSystem_ee8eb0 = window.LinkedInDMQueueDesignSystem_ee8eb0 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the primary action control.
 * Variants: primary (solid blue), secondary (white + border),
 * ghost (transparent), danger (solid red). Press shrinks; hover
 * darkens one step. Sized sm / md / lg to the control-height tokens.
 */
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  icon = null,
  iconTrailing = null,
  onClick,
  children,
  style,
  ...rest
}) {
  const [pressed, setPressed] = React.useState(false);
  const sizes = {
    sm: {
      height: 'var(--control-sm)',
      padding: '0 10px',
      font: 'var(--text-xs)',
      gap: '5px'
    },
    md: {
      height: 'var(--control-md)',
      padding: '0 14px',
      font: 'var(--text-sm)',
      gap: '6px'
    },
    lg: {
      height: 'var(--control-lg)',
      padding: '0 18px',
      font: 'var(--text-base)',
      gap: '7px'
    }
  };
  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--accent-fg)',
      border: '1px solid transparent',
      hover: 'var(--accent-hover)',
      active: 'var(--accent-active)'
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-body)',
      border: '1px solid var(--border-default)',
      hover: 'var(--surface-hover)',
      active: 'var(--surface-active)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-body)',
      border: '1px solid transparent',
      hover: 'var(--surface-hover)',
      active: 'var(--surface-active)'
    },
    danger: {
      background: 'var(--red-500)',
      color: 'var(--slate-0)',
      border: '1px solid transparent',
      hover: 'var(--red-600)',
      active: 'var(--red-700)'
    }
  };
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPressed(false);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    style: {
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : 'auto',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      fontFamily: 'var(--font-sans)',
      fontSize: s.font,
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      color: v.color,
      background: disabled ? v.background : pressed ? v.active : hover ? v.hover : v.background,
      border: v.border,
      borderRadius: 'var(--radius-sm)',
      boxShadow: variant === 'secondary' ? 'var(--shadow-xs)' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transform: pressed && !disabled ? 'scale(0.97)' : 'scale(1)',
      transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flexShrink: 0
    }
  }, icon) : null, children, iconTrailing ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flexShrink: 0
    }
  }, iconTrailing) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — a square, icon-only control for toolbars and row actions.
 * Variants: ghost (default, transparent), solid (white + border),
 * accent (blue), danger (red text). Sizes sm / md.
 */
function IconButton({
  variant = 'ghost',
  size = 'md',
  disabled = false,
  label,
  onClick,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const dim = size === 'sm' ? 26 : 32;
  const variants = {
    ghost: {
      color: 'var(--text-muted)',
      bg: 'transparent',
      border: 'transparent',
      hoverBg: 'var(--surface-hover)',
      hoverColor: 'var(--text-body)'
    },
    solid: {
      color: 'var(--text-body)',
      bg: 'var(--surface-card)',
      border: 'var(--border-default)',
      hoverBg: 'var(--surface-hover)',
      hoverColor: 'var(--text-strong)'
    },
    accent: {
      color: 'var(--accent-fg)',
      bg: 'var(--accent)',
      border: 'transparent',
      hoverBg: 'var(--accent-hover)',
      hoverColor: 'var(--accent-fg)'
    },
    danger: {
      color: 'var(--red-600)',
      bg: 'transparent',
      border: 'transparent',
      hoverBg: 'var(--red-50)',
      hoverColor: 'var(--red-700)'
    }
  };
  const v = variants[variant] || variants.ghost;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPressed(false);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      flexShrink: 0,
      color: hover ? v.hoverColor : v.color,
      background: hover ? v.hoverBg : v.bg,
      border: `1px solid ${v.border}`,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transform: pressed && !disabled ? 'scale(0.92)' : 'scale(1)',
      transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
/**
 * Dialog — a centered confirmation modal over a scrim. Used for
 * destructive confirms (Clear all data, Delete prospect).
 * Controlled via `open`; renders nothing when closed.
 */
function Dialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onCancel,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'rgba(20, 26, 35, 0.45)',
      animation: 'dmq-fade var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: 320,
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden',
      animation: 'dmq-pop var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 18px 14px'
    }
  }, title ? /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-strong)',
      marginBottom: 6
    }
  }, title) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      lineHeight: 'var(--leading-normal)'
    }
  }, children)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      justifyContent: 'flex-end',
      padding: '12px 18px',
      background: 'var(--surface-sunken)',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onCancel,
    style: {
      height: 'var(--control-md)',
      padding: '0 14px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-body)',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer'
    }
  }, cancelLabel), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onConfirm,
    style: {
      height: 'var(--control-md)',
      padding: '0 14px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--slate-0)',
      background: destructive ? 'var(--red-500)' : 'var(--accent)',
      border: '1px solid transparent',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer'
    }
  }, confirmLabel))), /*#__PURE__*/React.createElement("style", null, `
        @keyframes dmq-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes dmq-pop { from { opacity: 0; transform: translateY(6px) scale(0.98) } to { opacity: 1; transform: none } }
      `));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
/**
 * ProgressBar — the send-run progress indicator.
 * `value` / `max` drive the fill. Optional segmented mode shows
 * sent / failed / skipped as stacked colored portions.
 */
function ProgressBar({
  value = 0,
  max = 100,
  segments = null,
  height = 6,
  showLabel = false,
  style
}) {
  const pct = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      height,
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-pill)',
      overflow: 'hidden'
    }
  }, segments ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      width: '100%',
      height: '100%'
    }
  }, segments.map((seg, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: `${max > 0 ? seg.value / max * 100 : 0}%`,
      height: '100%',
      background: seg.color,
      transition: 'width var(--dur-slow) var(--ease-in-out)'
    }
  }))) : /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: `${pct}%`,
      height: '100%',
      background: 'var(--accent)',
      borderRadius: 'var(--radius-pill)',
      transition: 'width var(--dur-slow) var(--ease-in-out)'
    }
  })), showLabel ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, value, " / ", max), /*#__PURE__*/React.createElement("span", null, pct, "%")) : null);
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusBadge.jsx
try { (() => {
const STATUS = {
  pending: {
    bg: 'var(--status-pending-bg)',
    fg: 'var(--status-pending-fg)',
    dot: 'var(--status-pending-dot)',
    label: 'pending'
  },
  sending: {
    bg: 'var(--status-sending-bg)',
    fg: 'var(--status-sending-fg)',
    dot: 'var(--status-sending-dot)',
    label: 'sending'
  },
  sent: {
    bg: 'var(--status-sent-bg)',
    fg: 'var(--status-sent-fg)',
    dot: 'var(--status-sent-dot)',
    label: 'sent'
  },
  failed: {
    bg: 'var(--status-failed-bg)',
    fg: 'var(--status-failed-fg)',
    dot: 'var(--status-failed-dot)',
    label: 'failed'
  },
  skipped: {
    bg: 'var(--status-skipped-bg)',
    fg: 'var(--status-skipped-fg)',
    dot: 'var(--status-skipped-dot)',
    label: 'skipped'
  }
};

/**
 * StatusBadge — the color-coded pill that runs through the whole UI.
 * The "sending" state pulses its dot. Use `count` for filter chips.
 */
function StatusBadge({
  status = 'pending',
  count,
  label,
  style
}) {
  const s = STATUS[status] || STATUS.pending;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 9px 3px 7px',
      background: s.bg,
      color: s.fg,
      borderRadius: 'var(--radius-pill)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: s.dot,
      flexShrink: 0,
      animation: status === 'sending' ? 'dmq-pulse 1.4s var(--ease-in-out) infinite' : 'none'
    }
  }), label || s.label, count != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      opacity: 0.8
    }
  }, count) : null, /*#__PURE__*/React.createElement("style", null, `@keyframes dmq-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.75)}}`));
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/data/ProspectCard.jsx
try { (() => {
/**
 * ProspectCard — a single row in the queue. Shows name, title/company,
 * status badge and a message preview (or muted "No message"). Hover
 * lifts the card and reveals row actions passed via `actions`.
 */
function ProspectCard({
  name,
  designation,
  company,
  message,
  status = 'pending',
  failureReason,
  selected = false,
  onClick,
  actions = null,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const subtitle = [designation, company].filter(Boolean).join(' · ');
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      padding: '11px 12px',
      background: 'var(--surface-card)',
      border: `1px solid ${selected ? 'var(--border-focus)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-lg)',
      boxShadow: hover ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-md)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-strong)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, name), subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      marginTop: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, subtitle) : null), /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    status: status
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-snug)',
      color: message ? 'var(--text-body)' : 'var(--text-subtle)',
      fontStyle: message ? 'normal' : 'italic',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, message || 'No message'), status === 'failed' && failureReason ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--red-600)',
      display: 'flex',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\u26A0"), failureReason) : null, actions && (hover || selected) ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginTop: 2
    },
    onClick: e => e.stopPropagation()
  }, actions) : null);
}
Object.assign(__ds_scope, { ProspectCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProspectCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
/**
 * Toast — a transient confirmation (e.g. "Context copied to clipboard").
 * Static presentational component: render it when visible, position with
 * the wrapping container. Variants info / success / error.
 */
function Toast({
  variant = 'success',
  icon = null,
  children,
  onDismiss,
  style
}) {
  const accent = {
    success: 'var(--emerald-500)',
    error: 'var(--red-500)',
    info: 'var(--accent)'
  }[variant] || 'var(--emerald-500)';
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '9px',
      maxWidth: 320,
      padding: '9px 12px',
      background: 'var(--slate-900)',
      color: 'var(--slate-0)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: accent,
      flexShrink: 0
    }
  }, icon || /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: accent
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      lineHeight: 'var(--leading-snug)'
    }
  }, children), onDismiss ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      display: 'inline-flex',
      border: 'none',
      background: 'transparent',
      color: 'var(--slate-400)',
      cursor: 'pointer',
      padding: 0,
      marginLeft: 2,
      fontSize: 'var(--text-base)',
      lineHeight: 1
    }
  }, "\xD7") : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — single-line text field with optional leading icon and label.
 * Hairline border, blue focus ring. Sized to --control-md by default.
 */
function Input({
  label,
  hint,
  error,
  icon = null,
  size = 'md',
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const reactId = React.useId();
  const inputId = id || reactId;
  const height = size === 'sm' ? 'var(--control-sm)' : size === 'lg' ? 'var(--control-lg)' : 'var(--control-md)';
  const borderColor = error ? 'var(--red-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-body)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      height,
      padding: '0 10px',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: focus && !error ? 'var(--shadow-focus)' : 'var(--shadow-xs)',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
    }
  }, icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: 'var(--text-subtle)',
      flexShrink: 0
    }
  }, icon) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-strong)'
    }
  }, rest))), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--red-600)'
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/**
 * Switch — a compact toggle for settings (e.g. auto-retry).
 * Track turns blue when on; knob slides with a quick ease-out.
 */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  id,
  style
}) {
  const reactId = React.useId();
  const switchId = id || reactId;
  const W = 34,
    H = 20,
    KNOB = 14;
  const toggle = () => {
    if (!disabled && onChange) onChange(!checked);
  };
  const control = /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    id: switchId,
    "aria-checked": checked,
    disabled: disabled,
    onClick: toggle,
    style: {
      position: 'relative',
      width: W,
      height: H,
      flexShrink: 0,
      padding: 0,
      background: checked ? 'var(--accent)' : 'var(--slate-300)',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: (H - KNOB) / 2,
      left: checked ? W - KNOB - 3 : 3,
      width: KNOB,
      height: KNOB,
      borderRadius: '50%',
      background: 'var(--slate-0)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--dur-base) var(--ease-out)'
    }
  }));
  if (!label) return /*#__PURE__*/React.createElement("span", {
    style: style
  }, control);
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: switchId,
    style: {
      display: 'flex',
      alignItems: description ? 'flex-start' : 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, control, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-strong)'
    }
  }, label), description ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      lineHeight: 'var(--leading-snug)'
    }
  }, description) : null));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Textarea — multi-line field for notes and the message composer.
 * Optional character counter (useful for the ~500-char InMail limit).
 */
function Textarea({
  label,
  hint,
  value = '',
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  showCount = false,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const reactId = React.useId();
  const fieldId = id || reactId;
  const over = maxLength != null && value.length > maxLength;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-body)'
    }
  }, label), showCount ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: over ? 'var(--red-600)' : 'var(--text-subtle)'
    }
  }, value.length, maxLength != null ? `/${maxLength}` : '') : null) : null, /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    rows: rows,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      resize: 'vertical',
      minHeight: 64,
      padding: '8px 10px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      lineHeight: 'var(--leading-snug)',
      color: 'var(--text-strong)',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: `1px solid ${over ? 'var(--red-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: focus && !over ? 'var(--shadow-focus)' : 'var(--shadow-xs)',
      outline: 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
    }
  }, rest)), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.ProspectCard = __ds_scope.ProspectCard;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

})();
