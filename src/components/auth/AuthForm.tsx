import { SyntheticEvent, useEffect, useState } from 'react'
import { AuthError } from '@james-giesbrecht/critter-companion-utility'

import { useAuth } from 'context/Auth'
import useStore from 'store'
import { Providers, FormType } from 'typescript/enums'
import { InputCollection, FormState } from 'typescript/types'

import { Dialog, makeStyles } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { LoadingButton } from '@material-ui/lab'
import FormLink from 'components/auth/FormLink'
import Login from 'components/auth/forms/Login'
import SignUp from 'components/auth/forms/SignUp'
import ForgotPassword from 'components/auth/forms/ForgotPassword'
import VerificationEmail from 'components/auth/forms/VerificationEmail'
import GoogleIcon from 'components/icons/GoogleIcon'

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    width: 600,
    margin: theme.spacing(1),
  },
  googleButton: {
    color: theme.palette.getContrastText('#FFF'),
    backgroundColor: '#FFF',
    '&:hover': {
      backgroundColor: grey[200],
    },
  },
}))

export const authInputs: InputCollection = {
  email: {
    label: 'Email',
    type: 'email',
    value: '',
    validation: {
      required: true,
      email: true,
    },
  },
  password: {
    label: 'Password',
    type: 'password',
    value: '',
    validation: {
      required: true,
      minLength: 6,
    },
  },
  confirmPassword: {
    label: 'Confirm Password',
    type: 'password',
    value: '',
    validation: {
      required: true,
      matches: { name: 'password' },
      minLength: 6,
    },
  },
}

const AuthForm = () => {
  const classes = useStyles()
  const activeFormName = useStore<FormType | undefined>((state) => state.activeForm)
  const setActiveFormName = useStore((state) => state.setActiveForm)
  const setSnackbar = useStore((state) => state.setSnackbar)
  const [isLoading, setIsLoading] = useState<Providers | boolean>(false)
  const [submitError, setSubmitError] = useState('')
  const auth = useAuth()

  useEffect(() => {
    setSubmitError('')
  }, [activeFormName])

  const forms = {
    [FormType.Login]: Login,
    [FormType.SignUp]: SignUp,
    [FormType.ForgotPassword]: ForgotPassword,
    [FormType.VerificationEmail]: VerificationEmail,
  }

  const getProviderButtonText = (provider: Providers) =>
    activeFormName === FormType.SignUp ? `Sign up with ${provider}` : `Sign in with ${provider}`

  const handleClose = () => setActiveFormName(undefined)

  const ActiveForm = activeFormName && forms[activeFormName]

  const handleSubmit = async (e: SyntheticEvent, form?: FormState, submitType?: Providers) => {
    let result
    const submitMethod = submitType || activeFormName
    let email = ''
    let password = ''
    if (form) {
      email = form.inputs.email && form.inputs.email.value
      password = form.inputs.password && form.inputs.password.value
    }
    try {
      setSubmitError('')
      setIsLoading(submitType || true)
      switch (submitMethod) {
        case Providers.Google:
          result = await auth.signInWithGoogle()
          break
        case FormType.Login:
          result = await auth.login(email, password)
          break
        case FormType.SignUp:
          result = await auth.signUp(email, password)
          await result.user?.sendEmailVerification()
          setActiveFormName(FormType.VerificationEmail)
          return
        case FormType.ForgotPassword:
          result = await auth.resetPassword(email)
          setSnackbar({
            open: true,
            text: 'Password reset email successfully sent',
            severity: 'success',
          })
          break
        case FormType.VerificationEmail:
          result = await auth.user?.sendEmailVerification()
          setSnackbar({
            open: true,
            text: 'Verification email successfully sent',
            severity: 'success',
          })
          return
        default:
          throw new Error(`Invalid Submission Method: ${activeFormName}`)
      }
      setActiveFormName(undefined)
    } catch (error) {
      let errorMessage
      switch (error.code) {
        case AuthError.InvalidEmail:
          errorMessage = 'Please enter a valid email address.'
          break
        case AuthError.UserDisabled:
          errorMessage = `The account associated with ${email} has been disabled. Contact support for help with this issue.`
          break
        case AuthError.UserNotFound:
          errorMessage = (
            <>
              An account with this email does not exist, did you mean to{' '}
              <FormLink to={FormType.SignUp}>sign up.</FormLink>
            </>
          )
          break
        case AuthError.WrongPassword:
          errorMessage = (
            <>
              Incorrect password provided.{' '}
              <FormLink to={FormType.ForgotPassword}>Reset your password</FormLink>, or try signing
              in with another provider like Google.
            </>
          )
          break
        case AuthError.EmailAlreadyInUse:
          errorMessage = (
            <>
              An account already exists with this email, did you mean to{' '}
              <FormLink to={FormType.Login}>login?</FormLink>
              <br />
              An account may also already exist with another provider like Google.
            </>
          )
          break
        case AuthError.TooManyRequests:
          errorMessage = 'You have made too many requests, try again later.'
          break
        case AuthError.OperationNotAllowed:
        case AuthError.MissingContinueUri:
        case AuthError.MissingIOSBundleId:
        case AuthError.MissingAndroidPkgName:
        case AuthError.InvalidContinueUri:
        case AuthError.UnauthorizedContinueUri:
          errorMessage =
            'There is an error with the app configuration, please notify the administrator.'
          break
        case AuthError.WeakPassword:
          errorMessage = error.message
          break
        default:
          errorMessage = 'Something went wrong, try again later.'
      }
      setSubmitError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignInWithGoogle = (e: SyntheticEvent) => handleSubmit(e, undefined, Providers.Google)

  return (
    <Dialog
      classes={{ paper: classes.dialogPaper }}
      open={Boolean(ActiveForm)}
      onClose={handleClose}>
      {ActiveForm && (
        <ActiveForm
          error={Boolean(submitError)}
          helperText={submitError}
          isLoading={isLoading}
          providerButtons={
            <LoadingButton
              loading={isLoading === Providers.Google}
              loadingPosition="start"
              disabled={Boolean(isLoading)}
              className={classes.googleButton}
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={handleSignInWithGoogle}>
              {getProviderButtonText(Providers.Google)}
            </LoadingButton>
          }
          onSubmit={handleSubmit}
        />
      )}
    </Dialog>
  )
}

export default AuthForm
