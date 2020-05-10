import React from 'react'
import { Paper, InputBase, makeStyles, fade } from '@material-ui/core'
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab'
import LightModeIcon from '@material-ui/icons/Brightness7'
import DarkModeIcon from '@material-ui/icons/Brightness3'
import SearchIcon from '@material-ui/icons/Search'
import ClearIcon from '@material-ui/icons/ClearRounded'

const useStyles = makeStyles((theme) => ({
  controls: {
    padding: '15px',
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      marginTop: '-20px',
      paddingTop: '35px',
    },
    [theme.breakpoints.up('sm')]: {
      marginTop: '-25px',
      paddingTop: '40px',
    },
    [theme.breakpoints.up('md')]: {
      marginTop: '-30px',
      paddingTop: '45px',
    },
  },
  buttonGroup: {
    width: '100%',
    [theme.breakpoints.up('680')]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      textAlign: 'center',
      '& > *': {
        marginBottom: '10px',
      },
      '& > *:not(:last-child)': {
        marginRight: '10px',
      },
    },
  },
  searchRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  search: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    width: '100%',
    marginRight: '10px',
  },
  searchIcons: {
    padding: theme.spacing(0, 1),
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    padding: theme.spacing(1, 0, 1, 0),
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}))

// eslint-disable-next-line max-len
const Controls = ({ theme, toggleTheme, showAll, setShowAll, show, setShow, isNorthern, setIsNorthern, search, setSearch }) => {
  const classes = useStyles()

  const handleShowAllChange = (e, curShowAll) => {
    if (curShowAll === null || curShowAll === 'isCustom') {
      setShowAll('isCustom')
    } else {
      const newShow = show
      if (!newShow.includes('isNew')) newShow.push('isNew')
      if (!newShow.includes('isLeaving')) newShow.push('isLeaving')
      setShow(newShow)
      setShowAll(curShowAll)
    }
  }

  const handleShowChange = (e, newShow) => setShow(newShow)

  const handleThemeChange = (e, newTheme) => {
    if (newTheme !== theme && newTheme !== null) toggleTheme()
  }

  let clearIcon = null
  if (search !== '') {
    clearIcon = (
      <div
        className={classes.searchIcons}
        onClick={() => setSearch('')}
        onKeyPress={() => setSearch('')}
        role="button"
        tabIndex={0}
      >
        <ClearIcon />
      </div>
    )
  }

  return (
    <Paper classes={{ root: classes.controls }} elevation={3}>
      <div className={classes.buttonGroup}>
        <ToggleButton
          value={isNorthern}
          selected
          onChange={() => setIsNorthern((prevIsNorthern) => !prevIsNorthern)}
          size="small"
        >
          {isNorthern ? 'Northern' : 'Southern'}
        </ToggleButton>
        <ToggleButtonGroup
          value={showAll}
          size="small"
          exclusive
          onChange={handleShowAllChange}
        >
          <ToggleButton value="showAll">
            Show All
          </ToggleButton>
          <ToggleButton value="isAvailable">
            Available Now
          </ToggleButton>
          <ToggleButton value="isCustom">
            Custom
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={show}
          onChange={handleShowChange}
          size="small"
        >
          <ToggleButton value="isNew" disabled={showAll !== 'isCustom'}>
            New
          </ToggleButton>
          <ToggleButton value="isLeaving" disabled={showAll !== 'isCustom'}>
            Leaving
          </ToggleButton>
          <ToggleButton value="isDonated">
            Donated
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className={classes.searchRow}>
        <div className={classes.search}>
          <div className={classes.searchIcons}>
            <SearchIcon />
          </div>
          <InputBase
            placeholder="Search…"
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
            inputProps={{ 'aria-label': 'search' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {clearIcon}
        </div>
        <ToggleButtonGroup
          value={theme}
          size="small"
          exclusive
          onChange={handleThemeChange}
        >
          <ToggleButton value="light">
            <LightModeIcon />
          </ToggleButton>
          <ToggleButton value="dark">
            <DarkModeIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    </Paper>
  )
}

export default Controls
