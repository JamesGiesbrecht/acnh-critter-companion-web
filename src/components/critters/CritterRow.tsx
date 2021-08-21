import { FC, memo, SyntheticEvent, useRef, useState } from 'react'
import clsx from 'clsx'

import { useApi } from 'context/Api'
import useStore from 'store'
import { dot, hidden } from 'styles/cssClasses'
import { Statuses } from 'typescript/enums'
import { Critter } from 'typescript/types'

import { TableRow, TableCell, makeStyles, Typography, Button, ButtonProps } from '@material-ui/core'
import CritterInfo from 'components/critters/CritterInfo'
import Months from 'components/critters/Months'
import BlathersIcon from 'components/icons/BlathersIcon'
import { getCritterImagePath } from 'utility/critterUtility'

interface Props {
  critter: Critter
  hours: string
  showSizeColumn?: boolean
}

const useStyles = makeStyles((theme) => ({
  cell: {
    padding: '8px',
  },
  critterImgCell: {
    padding: '0 10px',
  },
  critterImg: {
    width: '40px',
  },
  status: {
    display: 'flex',
    flexDirection: 'column',
  },
  nameWrapper: {
    paddingLeft: '0',
    '& img': {
      height: '1.5em',
      marginRight: '5px',
      verticalAlign: 'top',
      display: 'inline',
    },
  },
  blathers: {
    filter: 'opacity(20%)',
  },
  notDonated: {
    '&:hover': {
      '& svg': {
        filter: 'opacity(60%)',
      },
    },
  },
  donated: {
    filter: 'opacity(85%)',
  },
  name: {
    display: 'flex',
    alignItems: 'center',
    textTransform: 'none',
  },
  dot,
  new: {
    backgroundColor: theme.palette.success.light,
  },
  leaving: {
    backgroundColor: theme.palette.error.light,
  },
  incoming: {
    backgroundColor: theme.palette.info.light,
  },
  location: {
    [theme.breakpoints.down('sm')]: {
      ...hidden,
    },
  },
  hours: {
    boxSizing: 'content-box',
    width: '85px',
    [theme.breakpoints.down('sm')]: {
      ...hidden,
    },
  },
  months: {
    boxSizing: 'content-box',
    width: '180px',
  },
  hiddenMd: {
    [theme.breakpoints.down('md')]: {
      ...hidden,
    },
  },
}))

const CritterRow: FC<Props> = ({ critter, hours, showSizeColumn }) => {
  const classes = useStyles()
  const isDonated = useStore((state) => state.donated[critter.id])
  const toggleDonated = useStore((state) => state.toggleDonated)
  const { donatedRef, updateCritters } = useApi()
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const nameButtonRef = useRef<HTMLButtonElement>(null)

  const handleDialogOpen = (e: SyntheticEvent) => {
    // Clicking the donate toggle
    if (
      nameButtonRef.current &&
      (nameButtonRef.current === e.target || nameButtonRef.current.contains(e.target as Node))
    ) {
      return
    }
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    window.setTimeout(() => {
      setDialogOpen(false)
    }, 100)
  }
  const handleDonatedCheck = () => {
    if (donatedRef) {
      if (!updateCritters({ [critter.id]: !isDonated })) {
        toggleDonated(critter.id)
      }
    } else {
      toggleDonated(critter.id)
    }
  }

  const nameButtonProps: ButtonProps = {
    className: clsx(classes.name, !isDonated && classes.notDonated),
    color: 'inherit',
    startIcon: <BlathersIcon className={clsx(classes.blathers, isDonated && classes.donated)} />,
    onClick: handleDonatedCheck,
  }

  const nameButtonContents = (
    <Typography component="span">
      {critter.name}
      {critter[Statuses.New] && <span className={clsx(classes.dot, classes.new)} />}
      {critter[Statuses.Leaving] && <span className={clsx(classes.dot, classes.leaving)} />}
      {critter[Statuses.Incoming] && <span className={clsx(classes.dot, classes.incoming)} />}
    </Typography>
  )

  return (
    <TableRow hover onClick={handleDialogOpen}>
      <TableCell className={clsx(classes.critterImgCell, classes.cell)}>
        <img
          className={classes.critterImg}
          src={getCritterImagePath(critter.id)}
          alt={critter.name}
        />
      </TableCell>
      <TableCell className={clsx(classes.nameWrapper, classes.cell)}>
        <Button {...nameButtonProps} ref={nameButtonRef}>
          {nameButtonContents}
        </Button>
      </TableCell>
      <TableCell className={classes.cell} align="right">
        {critter.value}
      </TableCell>
      <TableCell className={clsx(classes.cell, classes.location)} align="right">
        {critter.location}
      </TableCell>
      {showSizeColumn && (
        <TableCell className={clsx(classes.cell, classes.hiddenMd)} align="right">
          {critter.size}
        </TableCell>
      )}
      <TableCell className={clsx(classes.hours, classes.cell)} align="right">
        {hours}
      </TableCell>
      <TableCell className={clsx(classes.months, classes.hiddenMd, classes.cell)} align="right">
        <Months months={critter.months} />
      </TableCell>
      <CritterInfo
        critter={critter}
        dialogOpen={dialogOpen}
        hours={hours}
        nameButton={<Button {...nameButtonProps}>{nameButtonContents}</Button>}
        handleDialogClose={handleDialogClose}
      />
    </TableRow>
  )
}

export default memo(CritterRow)
