import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function urlValidator(...requiredPatterns: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // If no value, skip validation
    if (!control.value) {
      return null;
    }
    
    // Improved URL regex pattern that includes @ and other valid URL characters
    // This regex supports more valid URL formats while avoiding catastrophic backtracking
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]|[?&=%+,@~:#!])*\/?$/i;
    
    // Check if the URL format is valid at all
    if (!urlRegex.test(control.value)) {
      return { invalidUrl: true };
    }
    
    // If no specific patterns required, just validate as a URL
    if (!requiredPatterns || requiredPatterns.length === 0) {
      return null;
    }
    
    // Parse the input value - using a simpler extraction to get the domain
    let valueDomain;
    try {
      // Using URL constructor for safer parsing
      const url = new URL(control.value.startsWith('http') ? control.value : `https://${control.value}`);
      valueDomain = url.hostname;
    } catch (e) {
      // Fallback to regex if URL constructor fails
      const valueMatch = control.value.match(/^(?:https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6})/i);
      valueDomain = valueMatch ? valueMatch[1] : null;
    }
    
    if (!valueDomain) {
      return { invalidUrl: true };
    }
    
    // Check against each pattern
    for (const pattern of requiredPatterns) {
      let requiredDomain;
      
      try {
        // Extract domain from pattern
        const url = new URL(pattern.startsWith('http') ? pattern : `https://${pattern}`);
        requiredDomain = url.hostname;
      } catch (e) {
        // Fallback to regex if URL constructor fails
        const patternMatch = pattern.match(/^(?:https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6})/i);
        requiredDomain = patternMatch ? patternMatch[1] : null;
      }
      
      if (!requiredDomain) continue;
      
      // Check domain for this pattern
      if (valueDomain.toLowerCase() === requiredDomain.toLowerCase()) {
        return null; // Valid match found
      }
    }
    
    // No valid pattern matches found
    return {
      invalidDomain: {
        actual: valueDomain,
        allowedDomains: requiredPatterns.map(pattern => {
          try {
            const url = new URL(pattern.startsWith('http') ? pattern : `https://${pattern}`);
            return url.hostname;
          } catch (e) {
            const match = pattern.match(/^(?:https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6})/i);
            return match ? match[1] : pattern;
          }
        })
      }
    };
  };
}