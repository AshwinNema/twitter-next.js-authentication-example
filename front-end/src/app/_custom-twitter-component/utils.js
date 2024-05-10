export function openPopup(dialogWidth, dialogHeight) {
  const left = Math.max(screen.width / 2 - dialogWidth / 2, 0);
  const top = Math.max(screen.height / 2 - dialogHeight / 2, 0);

  return window.open(
    '',
    '',
    'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
      dialogWidth +
      ', height=' +
      dialogHeight +
      ', top=' +
      top +
      ', left=' +
      left
  );
}

function getOauthToken(
  loginUrl,
  oAuthVerifier,
  oauthToken,
  onSuccess,
  onFailure
) {
  return fetch(
    loginUrl +
      '?oauth_verifier=' +
      oAuthVerifier +
      '&oauth_token=' +
      oauthToken,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      onSuccess && onSuccess(data);
    })
    .catch(function (error) {
      onFailure && onFailure(error);
    });
}

export const polling = (loginUrl, popup, onSuccess, onFailure) => {
  const polling = setInterval(function () {
    if (!popup || popup.closed || popup.closed === undefined) {
      clearInterval(polling);
      onFailure && onFailure(new Error('Popup has been closed by user'));
    }

    var closeDialog = function closeDialog() {
      clearInterval(polling);
      popup.close();
    };

    try {
      if (
        !popup.location.hostname.includes('api.twitter.com') &&
        !popup.location.hostname == ''
      ) {
        if (popup.location.search) {
          const query = new URLSearchParams(popup.location.search);
          const oauthToken = query.get('oauth_token');
          const oauthVerifier = query.get('oauth_verifier');

          closeDialog();
          return getOauthToken(
            loginUrl,
            oauthVerifier,
            oauthToken,
            onSuccess,
            onFailure
          );
        } else {
          closeDialog();
          onFailure &&
            onFailure(
              new Error(
                'OAuth redirect has occurred but no query or hash parameters were found. ' +
                  'They were either not set during the redirect, or were removed—typically by a ' +
                  'routing library—before Twitter react component could read it.'
              )
            );
        }
      }
    } catch (error) {
      // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
      // A hack to get around same-origin security policy errors in IE.
    }
  }, 500);
};
