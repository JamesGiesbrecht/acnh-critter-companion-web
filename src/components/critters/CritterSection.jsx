import { useState, memo, useMemo } from 'react'
import useStore, { MainFilter, Statuses } from 'store'
import { removeItem } from 'assets/utility'
import { Collapse, Paper, makeStyles, Typography, Button } from '@material-ui/core'
import CrittersTable from 'components/critters/CrittersTable'
import ExpandMoreIcon from 'components/ui/ExpandMoreIcon'

const useStyles = makeStyles((theme) => ({
  critters: {
    padding: '10px 0',
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
    },
  },
  headingWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 10px',
  },
  heading: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingImg: {
    width: '55px',
    marginRight: '20px',
  },
}))

const CritterSection = ({ allCritters, type }) => {
  const classes = useStyles()
  const mainFilter = useStore((state) => state.filters.mainFilter)
  const statusFilters = useStore((state) => state.filters.statusFilters)
  const showDonated = useStore((state) => state.filters.showDonated)
  const search = useStore((state) => state.filters.search)
  const donated = useStore((state) => state.donated)

  const [expanded, setExpanded] = useState(false)

  const handleToggleExpand = () => setExpanded((prevExpanded) => !prevExpanded)

  const randomImg = useMemo(
    () => allCritters[Math.floor(Math.random() * allCritters.length)].image_path,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const filterCritters = () => {
    let filteredCritters = []
    if (search) {
      return allCritters.filter((critter) => critter.name.toLowerCase().search(search) !== -1)
    }

    if (mainFilter === MainFilter.All) {
      // Add all critters
      filteredCritters = allCritters
    } else if (mainFilter === MainFilter.Available) {
      // add critters that are available now
      filteredCritters = allCritters.filter((critter) => critter.isAvailableNow)
    } else {
      //  Checking if any of the conditions in show are true properties on the critter
      filteredCritters = allCritters.filter((critter) =>
        statusFilters.some((condition) => critter[condition]),
      )
    }

    if (!showDonated) {
      // remove critters that are not donated
      filteredCritters = filteredCritters.filter((critter) => !donated[critter.id])
    }

    return filteredCritters
  }

  const critters = filterCritters()

  let content
  if (critters.length === 0) {
    content = `No ${type.toLowerCase()} to show`
  } else {
    content = <CrittersTable critters={critters} />
  }

  return (
    <Paper classes={{ root: classes.critters }} elevation={7}>
      <div className={classes.headingWrapper}>
        <div className={classes.heading}>
          <img className={classes.headingImg} src={randomImg} alt={type} />
          <Typography variant="h4">{type}</Typography>
        </div>
        <Button
          size="large"
          color="inherit"
          onClick={handleToggleExpand}
          endIcon={<ExpandMoreIcon expand={expanded} />}>
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      <Collapse in={Boolean(expanded)}>{content}</Collapse>
    </Paper>
  )
}

export default memo(CritterSection)
