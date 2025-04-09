import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function urlValidator(...requiredPatterns: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // If no value, skip validation
    if (!control.value) {
      return null;
    }
    
    // Base URL regex pattern
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    // Check if the URL format is valid at all
    if (!urlRegex.test(control.value)) {
      return { invalidUrl: true };
    }
    
    // If no specific patterns required, just validate as a URL
    if (!requiredPatterns || requiredPatterns.length === 0) {
      return null;
    }
    
    // Parse the input value
    const valueMatch = control.value.match(/^(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6})/i);
    
    if (!valueMatch) {
      return { invalidUrl: true };
    }
    
    const [, valueProtocol, valueDomain] = valueMatch;
    
    // Check against each pattern
    for (const pattern of requiredPatterns) {
      const patternMatch = pattern.match(/^(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6})/i);
      
      if (!patternMatch) {
        continue; // Skip invalid patterns
      }
      
      const [, requiredProtocol, requiredDomain] = patternMatch;
      
      // Check protocol if specified in this pattern
      if (requiredProtocol && (!valueProtocol || valueProtocol.toLowerCase() !== requiredProtocol.toLowerCase())) {
        continue; // Protocol doesn't match this pattern, try next one
      }
      
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
          const match = pattern.match(/^(?:https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6})/i);
          return match ? match[1] : pattern;
        })
      } 
    };
  };
}