import React, { useState, useEffect, useRef, useContext } from 'react'
import SEO from '../components/seo'
import { graphql, Link } from 'gatsby'
import Pane, { Box, LineBox } from '../components/pane'
import { Title } from '../components/preview'
import { PushD, PushDContext } from '../components/pushd'
import { Progress } from '../components/text-ui/progress'
import ResizeProvider from '../resize'

import * as style from './post.module.scss'

export default function Template({ data }) {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark
  const { author, title, date, path, summary } = frontmatter

  const { cd } = useContext(PushDContext)
  const onClick = (from, to) => () => cd(to, from)

  // Set the element we will track for resizing
  const resize = useRef(null)

  // Track scroll amount for progress bar
  const progress = useScrollProgress()

  return (
    <div className="blog-post-container">
      <SEO title={title} description={summary} />
      <ResizeProvider track={resize}>
        <Pane ref={resize} foot={
          <React.Fragment>
            <Progress label='read' progress={Math.max(0, progress)} width={400} />
            <PushD current={path} />
          </React.Fragment>
        }>
          <LineBox className={style.postContainer} heading={
            <Title author={author} date={date}>{title}</Title>
          }>
            {frontmatter.draft && <DraftNotice />}
            <article
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <Link onClick={onClick(path, '/')} tabIndex="0" className={style.goBack} to="/">
              Go back
            </Link>
          </LineBox>
        </Pane>
      </ResizeProvider>
    </div>
  )
}

const DraftNotice = () => (
  <Box style={{ margin: '2em', marginLeft: '2em', paddingLeft: '1em' }}>
    <strong>This is a draft article; it is available for proofreading and testing.</strong>
  </Box>
)

function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [timer, setTimer] = useState(null)
  const [[height, scrollHeight, contentHeight], setHeight] = useState(pageHeight())

  useEffect(() => {
    function onChange() {
      clearTimeout(timer)
      setTimer(setTimeout(() => {
        setHeight(pageHeight())
        if (height < 2) {
          setProgress(1)
        } else {
          setProgress(window.pageYOffset / height)
        }
      }, 25))
    }
    window.addEventListener('scroll', onChange)
    return () => window.removeEventListener('scroll', onChange)
  }, [height, scrollHeight, contentHeight, timer])

  return progress
}

function pageHeight() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return [0, 0, 0];
  }
  const contentHeight = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight
  const scrollHeight = document.body.scrollHeight
  const height = scrollHeight > 0 ? scrollHeight - contentHeight : contentHeight
  return [height, scrollHeight, contentHeight]
}

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "YYYY-MM-DD")
        path
        title
        author
        draft
        summary
      }
    }
  }
`
