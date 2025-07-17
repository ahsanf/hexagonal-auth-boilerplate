export const buildSendOtpEmailHTML = (data: {
  fullName?: string;
  otpCode?: string;
}) => {
  return `<!doctype html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <title>
        Welcome to Stocktree Studio!
      </title>
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <!--<![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
        #outlook a { padding:0; }
        body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
        table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
        img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
        p { display:block;margin:13px 0; }
      </style>
      <!--[if mso]>
      <noscript>
      <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
      </xml>
      </noscript>
      <![endif]-->
      <!--[if lte mso 11]>
      <style type="text/css">
        .mj-outlook-group-fix { width:100% !important; }
      </style>
      <![endif]-->
      
      
      <style type="text/css">
        @media only screen and (min-width:480=px) {
          .mj-column-per-100 { width:100% !important; max-width: 100%; }
        }
      </style>
      <style media="screen and (min-width:480px)">
        .moz-text-html .mj-column-per-100 { width:100% !important; max-width: 100%; }
      </style>
      
    
      <style type="text/css">
      
      
  
      @media only screen and (max-width:480px) {
        table.mj-full-width-mobile { width: 100% !important; }
        td.mj-full-width-mobile { width: auto !important; }
      }
    
      </style>
      <style type="text/css">
      
      </style>
      
    </head>
    <body style="word-spacing:normal;">
      
      
        <div
           style=""
        >
          
        
        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#F9FAFB" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      
        
        <div  style="background:#F9FAFB;background-color:#F9FAFB;margin:0px auto;border-radius:12px;max-width:600px;">
          
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#F9FAFB;background-color:#F9FAFB;width:100%;border-radius:12px;"
          >
            <tbody>
              <tr>
                <td
                   style="border:1px solid #eaecf0;direction:ltr;font-size:0px;padding:20px;text-align:center;"
                >
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" width="600px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:558px;" width="558" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      
        
        <div  style="margin:0px auto;max-width:558px;">
          
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"
          >
            <tbody>
              <tr>
                <td
                   style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;"
                >
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:558px;" ><![endif]-->
              
        <div
           class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"
        >
          
        <table
           border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"
        >
          <tbody>
            
                <tr>
                  <td
                     align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"
                  >
                    
        <table
           border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;"
        >
          <tbody>
            <tr>
              <td  style="width:178px;">
                
        <img
           alt="Stocktree Studio" height="32" src="https://stocktree.io/landing/img/logo/logo-full.png" style="border:0;display:block;outline:none;text-decoration:none;height:32px;width:100%;font-size:13px;" width="178"
        />
      
              </td>
            </tr>
          </tbody>
        </table>
      
                  </td>
                </tr>
              
          </tbody>
        </table>
      
        </div>
      
            <!--[if mso | IE]></td></tr></table><![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
      
        
        <!--[if mso | IE]></td></tr></table></td></tr><tr><td class="" width="600px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:558px;" width="558" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      
        
        <div  style="background:#ffffff;background-color:#ffffff;margin:0px auto;border-radius:20px;max-width:558px;">
          
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;border-radius:20px;"
          >
            <tbody>
              <tr>
                <td
                   style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;"
                >
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:558px;" ><![endif]-->
              
        <div
           class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"
        >
          
        <table
           border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"
        >
          <tbody>
            
                <tr>
                  <td
                     align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"
                  >
                    
        <div
           style="font-family:Helvetica;font-size:20px;font-weight:bold;line-height:24px;text-align:left;color:#101828;"
        >Welcome to Stocktree Studio!</div>
      
                  </td>
                </tr>
              
          </tbody>
        </table>
      
        </div>
      
            <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:558px;" ><![endif]-->
              
        <div
           class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"
        >
          
        <table
           border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"
        >
          <tbody>
            <tr>
              <td  style="vertical-align:top;padding-top:12px;">
                
        <table
           border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%"
        >
          <tbody>
            
                <tr>
                  <td
                     align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"
                  >
                    
        <div
           style="font-family:Helvetica;font-size:14px;line-height:1;text-align:left;color:#475467;"
        >Hi, ${data.fullName ?? ''}</div>
      
                  </td>
                </tr>
              
          </tbody>
        </table>
      
              </td>
            </tr>
          </tbody>
        </table>
      
        </div>
      
            <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:558px;" ><![endif]-->
              
        <div
           class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"
        >
          
        <table
           border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"
        >
          <tbody>
            
                <tr>
                  <td
                     align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"
                  >
                    
        <div
           style="font-family:Helvetica;font-size:14px;line-height:1;text-align:left;color:#475467;"
        >Your account sign up OTP code is:</div>
      
                  </td>
                </tr>
              
          </tbody>
        </table>
      
        </div>
      
            <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:558px;" ><![endif]-->
              
        <div
           class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"
        >
          
        <table
           border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"
        >
          <tbody>
            <tr>
              <td  style="vertical-align:top;padding-top:10px;">
                
        <table
           border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%"
        >
          <tbody>
            
                <tr>
                  <td
                     align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"
                  >
                    
        <div
           style="font-family:Helvetica;font-size:40px;font-weight:bold;line-height:1;text-align:left;color:#101828;"
        >${data.otpCode}</div>
      
                  </td>
                </tr>
              
          </tbody>
        </table>
      
              </td>
            </tr>
          </tbody>
        </table>
      
        </div>
      
            <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:558px;" ><![endif]-->
              
        <div
           class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"
        >
          
        <table
           border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"
        >
          <tbody>
            
                <tr>
                  <td
                     align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"
                  >
                    
        <div
           style="font-family:Helvetica;font-size:14px;line-height:30px;text-align:left;color:#475467;"
        >Insert the code to Stocktree platform immediately as it will automatically expire in 5 minutes if not used. If this code doesn’t work, please click the “Resend Code” button on the platform. <br /><br /> Thank you, <br />
              <span font-weight="bold" color="#0665eb">stocktree.io</span></div>
      
                  </td>
                </tr>
              
          </tbody>
        </table>
      
        </div>
      
            <!--[if mso | IE]></td></tr></table><![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
      
        
        <!--[if mso | IE]></td></tr></table></td></tr><tr><td class="" width="600px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:558px;" width="558" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      
        
        <div  style="margin:0px auto;max-width:558px;">
          
          <table
             align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"
          >
            <tbody>
              <tr>
                <td
                   style="direction:ltr;font-size:0px;padding:20px;text-align:center;"
                >
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:518px;" ><![endif]-->
              
        <div
           class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"
        >
          
        <table
           border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"
        >
          <tbody>
            
                <tr>
                  <td
                     align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"
                  >
                    
        <div
           style="font-family:Helvetica;font-size:14px;font-weight:bold;line-height:1;text-align:center;color:#667085;"
        >Stocktree - Beautiful Marketing Content in Seconds</div>
      
                  </td>
                </tr>
              
                <tr>
                  <td
                     align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"
                  >
                    
        <div
           style="font-family:Helvetica;font-size:10px;line-height:14px;text-align:center;color:#667085;"
        >Stocktree is a one stop design creation platform. Just type what you want and let it work for you. Save your time & budget and get it done!</div>
      
                  </td>
                </tr>
              
                <tr>
                  <td
                     align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"
                  >
                    
        <p
           style="border-top:solid 1px lightgrey;font-size:1px;margin:0px auto;width:100%;"
        >
        </p>
        
        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px lightgrey;font-size:1px;margin:0px auto;width:468px;" role="presentation" width="468px" ><tr><td style="height:0;line-height:0;"> &nbsp;
  </td></tr></table><![endif]-->
      
      
                  </td>
                </tr>
              
                <tr>
                  <td
                     align="center" style="font-size:0px;padding:10px 25px;padding-top:20px;word-break:break-word;"
                  >
                    
        <div
           style="font-family:Helvetica;font-size:10px;line-height:14px;text-align:center;color:#667085;"
        >Copyright © 2023 Enamo Studios rights reserved</div>
      
                  </td>
                </tr>
              
          </tbody>
        </table>
      
        </div>
      
            <!--[if mso | IE]></td></tr></table><![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
      
        
        <!--[if mso | IE]></td></tr></table></td></tr></table><![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
      
        
        <!--[if mso | IE]></td></tr></table><![endif]-->
      
      
        </div>
      
    </body>
  </html>
    `
}