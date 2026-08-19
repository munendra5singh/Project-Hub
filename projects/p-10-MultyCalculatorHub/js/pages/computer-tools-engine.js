/* computer-tools-engine.js — extracted verbatim from computer-tools.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const cryptoOutput = document.getElementById('cryptoOutput');
            const toast = document.getElementById('toast');

            // Secure Signature Token to avoid string breakdown crashes
            const VAULT_SIGNATURE = "[LOCKED_VAULT]";

            /* THEME HANDLING CONTROLLER */
            function initTheme() {
                const isDarkMode = localStorage.getItem("globalDarkMode") === "enabled";
                applyTheme(isDarkMode ? 'dark' : 'light');
            }
            function applyTheme(theme) {
                if (theme === 'dark') document.body.classList.add("dark-mode");
                else document.body.classList.remove("dark-mode");
            }
            themeToggle.addEventListener('click', () => {
                const isDarkActive = document.body.classList.contains("dark-mode");
                const targetState = !isDarkActive ? 'enabled' : 'disabled';
                localStorage.setItem("globalDarkMode", targetState);
                applyTheme(!isDarkActive ? 'dark' : 'light');
            });
            window.addEventListener('storage', (e) => { 
                if (e.key === 'globalDarkMode') applyTheme(e.newValue === 'enabled' ? 'dark' : 'light'); 
            });

            /* GLOBAL CENTRALIZED MONITOR LOGGING LOGIC */
            function logEvent(action, input, output) {
                let logs = JSON.parse(localStorage.getItem('global_calculation_logs')) || [];
                logs.unshift({ 
                    id: Date.now(), 
                    timestamp: new Date().toISOString(), 
                    module: "Computer Utilities", 
                    input: `${action}: ${input.substring(0,20)}...`, 
                    output: output.substring(0,40) 
                });
                if (logs.length > 50) logs.pop();
                localStorage.setItem('global_calculation_logs', JSON.stringify(logs));
            }

            /* STANDARD BASE64 LOGICS */
            window.processBase64 = function(mode) {
                const input = document.getElementById('cryptoInput').value;
                if(!input) return cryptoOutput.innerHTML = "<span style='color:#ef4444;'>Error: Input string cannot be blank.</span>";
                try {
                    let result = mode === 'encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)));
                    cryptoOutput.innerText = result;
                    logEvent(`Base64 ${mode}`, input, result);
                } catch(e) { 
                    cryptoOutput.innerHTML = "<span style='color:#ef4444;'>Error: Invalid character sequence parameters for Base64 execution.</span>"; 
                }
            }

            /* ADVANCED HIGH-PERFORMANCE SMART LOCK / UNLOCK CIPHER ENGINE */
            window.processCryptoToggle = function() {
                const input = document.getElementById('cryptoInput').value.trim();
                const key = document.getElementById('secretKey').value.trim();
                
                if(!input) return cryptoOutput.innerHTML = "<span style='color:#ef4444;'>Error: Please enter a message or code first.</span>";
                if(!key) return cryptoOutput.innerHTML = "<span style='color:#ef4444;'>Error: Please enter a Secret Key Password (चाबी).</span>";

                // Step 1: Detect Mode. If input starts with signature or is valid Hex, analyze for decryption
                let isEncryptedPayload = false;
                let decryptedHexAttempt = "";

                if (input.startsWith(VAULT_SIGNATURE)) {
                    isEncryptedPayload = true;
                    decryptedHexAttempt = input.substring(VAULT_SIGNATURE.length);
                } else {
                    // Fail-safe check in case the user accidentally missed the signature token prefix
                    try {
                        let plainTextTry = hexToString(input);
                        let xorTry = xorCipherEngine(plainTextTry, key);
                        if (xorTry.startsWith(VAULT_SIGNATURE)) {
                            isEncryptedPayload = true;
                            decryptedHexAttempt = input;
                        }
                    } catch(e) { isEncryptedPayload = false; }
                }

                if (!isEncryptedPayload) {
                    // ACTION: ENCRYPT & LOCK THE PLAIN TEXT NATIVELY
                    let payloadToLock = VAULT_SIGNATURE + input;
                    let xorObfuscated = xorCipherEngine(payloadToLock, key);
                    let finalHexOutput = stringToHex(xorObfuscated);
                    
                    // Prepend main signature block explicitly
                    let publicSecureString = VAULT_SIGNATURE + finalHexOutput;

                    cryptoOutput.innerText = publicSecureString;
                    logEvent("Locked Message", input, publicSecureString);
                    showToast("Message Locked Successfully!");
                } else {
                    // ACTION: DECRYPT & UNLOCK THE SEALS VIA PASSWORD KEYS MATCH
                    try {
                        let stringFromHexPayload = hexToString(decryptedHexAttempt);
                        let unpackedMessage = xorCipherEngine(stringFromHexPayload, key);

                        if(unpackedMessage.startsWith(VAULT_SIGNATURE)) {
                            let clearOriginalMessage = unpackedMessage.substring(VAULT_SIGNATURE.length);
                            cryptoOutput.innerText = clearOriginalMessage;
                            logEvent("Unlocked Message", input, clearOriginalMessage);
                            showToast("Message Unlocked Successfully!");
                        } else {
                            cryptoOutput.innerHTML = "<span style='color:#ef4444;'>Error: Wrong Secret Key/Password! Access Denied.</span>";
                        }
                    } catch(err) {
                        cryptoOutput.innerHTML = "<span style='color:#ef4444;'>Error: Wrong Secret Key/Password or Corrupted Secure Seals.</span>";
                    }
                }
            }

            /* Advanced Robust XOR Binary Matrix Logic Changers */
            function xorCipherEngine(text, key) {
                let output = "";
                for (let i = 0; i < text.length; i++) {
                    let charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                    output += String.fromCharCode(charCode);
                }
                return output;
            }

            /* Convert String data safely into Hex format array mapping bounds */
            function stringToHex(str) {
                let hex = "";
                for(let i=0; i<str.length; i++) {
                    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
                }
                return hex;
            }

            /* Restore String from safe hex code mapping bounds */
            function hexToString(hex) {
                let str = "";
                for(let i=0; i<hex.length; i+=2) {
                    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                }
                return str;
            }

            /* ADVANCED FULL FACTORY RESET PREFERENCES BUTTON HOOKS */
            window.resetUtilities = function() {
                document.getElementById('cryptoInput').value = "";
                document.getElementById('secretKey').value = "";
                cryptoOutput.innerText = "Waiting for execution command...";
                showToast("Utilities Cleared Perfectly!");
            }

            /* CLIPBOARD ENGINE REUSE TRACES */
            window.copyOutputContent = function() {
                const text = cryptoOutput.innerText;
                if(!text || text.includes("Waiting for") || text.includes("Error:")) return;
                navigator.clipboard.writeText(text);
                showToast("Copied to Clipboard");
            }

            function showToast(msg) { 
                toast.textContent = msg; 
                toast.classList.add('show'); 
                setTimeout(() => toast.classList.remove('show'), 2000); 
            }

            initTheme();
        });
